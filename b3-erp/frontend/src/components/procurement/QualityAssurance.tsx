'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, Package, AlertTriangle, CheckCircle,
  XCircle, Clock, TrendingUp, Shield, FileText, Camera,
  Settings, Download, Upload, Calendar, Filter, Search,
  BarChart3, PieChart, Activity, Users, Zap, AlertCircle,
  Target, Award, Gauge, ChevronRight, Eye, Edit3
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter, Treemap, Sankey
} from 'recharts';
import { procurementPagesService } from '@/services/procurement-pages.service';
import {
  procurementQualityService,
  ProcurementInspection,
  ProcurementInspectionTemplate,
  ProcurementNcr,
} from '@/services/procurement-quality.service';

interface QualityAssuranceProps {}

interface SupplierQualityScore {
  supplier: string;
  score: number;
  trend: string;
  inspections: number;
}

type QAModal =
  | { type: 'create-inspection' }
  | { type: 'record-results'; inspection: ProcurementInspection }
  | { type: 'reject'; inspection: ProcurementInspection }
  | { type: 'view-inspection'; inspection: ProcurementInspection }
  | { type: 'issue-ncr'; inspection?: ProcurementInspection }
  | { type: 'create-template' }
  | { type: 'edit-template'; template: ProcurementInspectionTemplate }
  | { type: 'track-trends' }
  | { type: 'supplier-report'; supplierName: string }
  | { type: 'compliance-monitoring' };

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>): void {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const QualityAssurance: React.FC<QualityAssuranceProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [modal, setModal] = useState<QAModal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const closeModal = () => { setModal(null); setFormError(null); setSubmitting(false); };

  // Quality metrics - loaded from API (falls back to derived defaults)
  const [qualityMetrics, setQualityMetrics] = useState({
    passRate: 96.5,
    defectRate: 3.5,
    inspectionsToday: 45,
    pendingInspections: 12,
    avgInspectionTime: '24 min',
    complianceScore: 98.2
  });

  // Inspection queue — loaded from the procurement quality backend.
  const [inspectionQueue, setInspectionQueue] = useState<ProcurementInspection[]>([]);
  const [ncrs, setNcrs] = useState<ProcurementNcr[]>([]);

  const loadInspections = React.useCallback(async () => {
    try {
      const data = await procurementQualityService.getInspections(filterStatus);
      setInspectionQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load inspections:', err);
      setInspectionQueue([]);
    }
  }, [filterStatus]);

  const loadNcrs = React.useCallback(async () => {
    try {
      const data = await procurementQualityService.getNcrs();
      setNcrs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load NCRs:', err);
      setNcrs([]);
    }
  }, []);

  useEffect(() => { void loadInspections(); }, [loadInspections]);
  useEffect(() => { void loadNcrs(); }, [loadNcrs]);

  const displayedInspections = inspectionQueue.filter((i) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (i.poNumber ?? '').toLowerCase().includes(term) ||
      (i.supplier ?? '').toLowerCase().includes(term) ||
      (i.items ?? '').toLowerCase().includes(term) ||
      (i.id ?? '').toLowerCase().includes(term)
    );
  });

  // Quality trends - loaded from API
  const [qualityTrends, setQualityTrends] = useState<{ month: string; passRate: number; defectRate: number; inspections: number }[]>([]);

  // Defect categories - loaded from API
  const [defectCategories, setDefectCategories] = useState<{ name: string; value: number; color: string }[]>([]);

  // Supplier quality scores - loaded from API
  const [supplierQualityScores, setSupplierQualityScores] = useState<SupplierQualityScore[]>([]);

  useEffect(() => {
    const loadSupplierQualityScores = async () => {
      try {
        const data = await procurementPagesService.getQualityAssuranceInsights();
        const vendors = data?.vendors ?? [];
        if (Array.isArray(vendors) && vendors.length > 0) {
          setSupplierQualityScores(
            vendors.map((v: any) => ({
              supplier: v?.vendorName ?? '',
              score: v?.qualityScore ?? 0,
              trend: 'stable',
              inspections: v?.inspectionsTotal ?? 0,
            }))
          );
        }
        setQualityTrends(Array.isArray(data?.qualityTrends) ? data.qualityTrends : []);
        setDefectCategories(Array.isArray(data?.defectCategories) ? data.defectCategories : []);
        setComplianceStandards(Array.isArray(data?.complianceStandards) ? data.complianceStandards : []);
        const summary = data?.summary;
        if (summary) {
          setQualityMetrics((prev) => ({
            ...prev,
            passRate: summary.avgQualityScore ?? prev.passRate,
            defectRate: summary.avgDefectRate ?? prev.defectRate,
            complianceScore: summary.avgQualityScore ?? prev.complianceScore,
            pendingInspections:
              typeof summary.totalVendors === 'number' && typeof summary.certifiedVendors === 'number'
                ? summary.totalVendors - summary.certifiedVendors
                : prev.pendingInspections,
          }));
        }
      } catch (error) {
        console.error('Failed to load supplier quality scores:', error);
      }
    };
    loadSupplierQualityScores();
  }, []);

  // Inspection templates — loaded from the procurement quality backend.
  const [inspectionTemplates, setInspectionTemplates] = useState<ProcurementInspectionTemplate[]>([]);

  const loadTemplates = React.useCallback(async () => {
    try {
      const data = await procurementQualityService.getTemplates();
      setInspectionTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load inspection templates:', err);
      setInspectionTemplates([]);
    }
  }, []);

  useEffect(() => { void loadTemplates(); }, [loadTemplates]);

  // Compliance standards - loaded from API
  const [complianceStandards, setComplianceStandards] = useState<{ standard: string; status: string; score: number; lastAudit: string }[]>([]);

  // ---- form state ----
  const emptyInspection = {
    poNumber: '', supplier: '', items: '', quantity: '', priority: 'medium', dueDate: '', riskLevel: 'medium', templateId: '',
  };
  const emptyResults = { result: 'pass', defectsFound: '', inspector: '', resultNotes: '' };
  const emptyTemplate = { name: '', category: '', checkpoints: '', description: '' };
  const emptyNcr = { title: '', description: '', severity: 'minor', supplier: '', rootCause: '' };
  const [inspectionForm, setInspectionForm] = useState(emptyInspection);
  const [resultsForm, setResultsForm] = useState(emptyResults);
  const [rejectReason, setRejectReason] = useState('');
  const [templateForm, setTemplateForm] = useState(emptyTemplate);
  const [ncrForm, setNcrForm] = useState(emptyNcr);

  // Handler 1: Create Inspection
  const handleCreateInspection = () => {
    setInspectionForm(emptyInspection);
    setFormError(null);
    setModal({ type: 'create-inspection' });
  };
  const submitInspection = async () => {
    if (!inspectionForm.supplier.trim() && !inspectionForm.poNumber.trim()) {
      setFormError('Provide at least a PO number or supplier.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementQualityService.createInspection({
        poNumber: inspectionForm.poNumber.trim() || undefined,
        supplier: inspectionForm.supplier.trim() || undefined,
        items: inspectionForm.items.trim() || undefined,
        quantity: Number(inspectionForm.quantity) || 0,
        priority: inspectionForm.priority,
        dueDate: inspectionForm.dueDate || undefined,
        riskLevel: inspectionForm.riskLevel,
        templateId: inspectionForm.templateId || undefined,
        status: 'pending',
      });
      await loadInspections();
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create inspection');
      setSubmitting(false);
    }
  };

  // Handler 2: Record Results
  const handleRecordResults = (inspection?: ProcurementInspection) => {
    const target = inspection ?? inspectionQueue[0];
    if (!target) {
      setFormError('No inspection available to record results for. Create one first.');
      setModal({ type: 'create-inspection' });
      return;
    }
    setResultsForm(emptyResults);
    setFormError(null);
    setModal({ type: 'record-results', inspection: target });
  };
  const submitResults = async (inspection: ProcurementInspection) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementQualityService.recordResults(inspection.id, {
        result: resultsForm.result,
        defectsFound: resultsForm.defectsFound ? Number(resultsForm.defectsFound) : undefined,
        inspector: resultsForm.inspector.trim() || undefined,
        resultNotes: resultsForm.resultNotes.trim() || undefined,
        status: 'completed',
      });
      await loadInspections();
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to record results');
      setSubmitting(false);
    }
  };

  // Handler 3: Reject Material
  const handleRejectMaterial = (inspection?: ProcurementInspection) => {
    const target = inspection ?? inspectionQueue[0];
    if (!target) {
      setFormError('No inspection available to reject. Create one first.');
      setModal({ type: 'create-inspection' });
      return;
    }
    setRejectReason('');
    setFormError(null);
    setModal({ type: 'reject', inspection: target });
  };
  const submitReject = async (inspection: ProcurementInspection) => {
    if (!rejectReason.trim()) {
      setFormError('Rejection reason is required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementQualityService.rejectInspection(inspection.id, { rejectionReason: rejectReason.trim() });
      await loadInspections();
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to reject material');
      setSubmitting(false);
    }
  };

  // Handler 4: Issue NCR
  const handleIssueNCR = (inspection?: ProcurementInspection) => {
    setNcrForm({ ...emptyNcr, supplier: inspection?.supplier ?? '' });
    setFormError(null);
    setModal({ type: 'issue-ncr', inspection });
  };
  const submitNcr = async (inspection?: ProcurementInspection) => {
    if (!ncrForm.title.trim()) {
      setFormError('NCR title is required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementQualityService.createNcr({
        title: ncrForm.title.trim(),
        description: ncrForm.description.trim() || undefined,
        severity: ncrForm.severity,
        supplier: ncrForm.supplier.trim() || undefined,
        rootCause: ncrForm.rootCause.trim() || undefined,
        inspectionId: inspection?.id,
        supplierId: inspection?.supplierId,
        status: 'open',
      });
      await loadNcrs();
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to issue NCR');
      setSubmitting(false);
    }
  };

  // Handler 5: Track Trends
  const handleTrackTrends = () => { setFormError(null); setModal({ type: 'track-trends' }); };

  // Handler 6: View Supplier Report
  const handleViewSupplierReport = (supplierName: string) => { setFormError(null); setModal({ type: 'supplier-report', supplierName }); };

  // Handler 7: New Inspection Button
  const handleNewInspection = () => {
    handleCreateInspection();
  };

  // Handler 8: Generate Report -> CSV of the live inspection queue.
  const handleGenerateReport = () => {
    downloadCsv(
      'quality-inspections.csv',
      inspectionQueue.map((i) => ({
        poNumber: i.poNumber ?? '',
        supplier: i.supplier ?? '',
        items: i.items ?? '',
        quantity: i.quantity,
        priority: i.priority,
        status: i.status,
        result: i.result ?? '',
        defectsFound: i.defectsFound ?? '',
        inspector: i.inspector ?? '',
        dueDate: i.dueDate ?? '',
      })),
    );
  };

  // Handler 9: Create Template
  const handleCreateTemplate = () => {
    setTemplateForm(emptyTemplate);
    setFormError(null);
    setModal({ type: 'create-template' });
  };
  const submitCreateTemplate = async () => {
    if (!templateForm.name.trim()) {
      setFormError('Template name is required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementQualityService.createTemplate({
        name: templateForm.name.trim(),
        category: templateForm.category.trim() || undefined,
        checkpoints: Number(templateForm.checkpoints) || 0,
        description: templateForm.description.trim() || undefined,
      });
      await loadTemplates();
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create template');
      setSubmitting(false);
    }
  };

  // Handler 10: Use Template -> bumps usage counter, opens a prefilled inspection.
  const handleUseTemplate = async (template: ProcurementInspectionTemplate) => {
    try {
      await procurementQualityService.useTemplate(template.id);
      await loadTemplates();
    } catch (err) {
      console.error('Failed to mark template used:', err);
    }
    setInspectionForm({ ...emptyInspection, templateId: template.id });
    setFormError(null);
    setModal({ type: 'create-inspection' });
  };

  // Handler 11: Edit Template
  const handleEditTemplate = (template: ProcurementInspectionTemplate) => {
    setTemplateForm({
      name: template.name ?? '',
      category: template.category ?? '',
      checkpoints: String(template.checkpoints ?? ''),
      description: template.description ?? '',
    });
    setFormError(null);
    setModal({ type: 'edit-template', template });
  };
  const submitEditTemplate = async (template: ProcurementInspectionTemplate) => {
    if (!templateForm.name.trim()) {
      setFormError('Template name is required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementQualityService.updateTemplate(template.id, {
        name: templateForm.name.trim(),
        category: templateForm.category.trim() || undefined,
        checkpoints: Number(templateForm.checkpoints) || 0,
        description: templateForm.description.trim() || undefined,
      });
      await loadTemplates();
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update template');
      setSubmitting(false);
    }
  };

  // Handler 12: Compliance Monitoring
  const handleComplianceMonitoring = () => { setFormError(null); setModal({ type: 'compliance-monitoring' }); };

  // View an inspection detail.
  const handleViewInspection = (inspection: ProcurementInspection) => { setFormError(null); setModal({ type: 'view-inspection', inspection }); };

  const renderOverview = () => (
    <div className="space-y-3">
      {/* Quality Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Pass Rate</p>
              <p className="text-2xl font-bold">{qualityMetrics.passRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Defect Rate</p>
              <p className="text-2xl font-bold">{qualityMetrics.defectRate}%</p>
            </div>
            <XCircle className="h-8 w-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Inspections</p>
              <p className="text-2xl font-bold">{qualityMetrics.inspectionsToday}</p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{qualityMetrics.pendingInspections}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Time</p>
              <p className="text-2xl font-bold">{qualityMetrics.avgInspectionTime}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Compliance</p>
              <p className="text-2xl font-bold">{qualityMetrics.complianceScore}%</p>
            </div>
            <Shield className="h-8 w-8 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Quality Trends Chart */}
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Quality Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={qualityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="passRate" stroke="#10B981" name="Pass Rate %" strokeWidth={2} />
              <Line type="monotone" dataKey="defectRate" stroke="#EF4444" name="Defect Rate %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Defect Categories */}
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Defect Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={defectCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {defectCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Quality Scores */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Supplier Quality Scores</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Supplier</th>
                <th className="text-left py-2">Quality Score</th>
                <th className="text-left py-2">Trend</th>
                <th className="text-left py-2">Inspections</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supplierQualityScores.map((supplier, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2">{supplier.supplier}</td>
                  <td className="py-2">
                    <div className="flex items-center">
                      <span className="font-semibold">{supplier.score}%</span>
                      <div className="ml-2 w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            supplier.score >= 98 ? 'bg-green-500' :
                            supplier.score >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${supplier.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      supplier.trend === 'up' ? 'bg-green-100 text-green-800' :
                      supplier.trend === 'down' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.trend === 'up' ? '↑' : supplier.trend === 'down' ? '↓' : '→'}
                      {supplier.trend}
                    </span>
                  </td>
                  <td className="py-2">{supplier.inspections}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleViewSupplierReport(supplier.supplier)}
                      title="View supplier report"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInspections = () => (
    <div className="space-y-3">
      {/* Inspection Queue Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Inspection Queue</h3>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border rounded-lg"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search inspections..."
              className="outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleNewInspection}
            title="New inspection"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Inspection
          </button>
        </div>
      </div>

      {/* Inspection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {displayedInspections.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
            No inspections in the queue. Use “New Inspection” to create one.
          </div>
        )}
        {displayedInspections.map((inspection) => (
          <div key={inspection.id} className="bg-white rounded-lg shadow p-3 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-lg">{inspection.poNumber || inspection.id.slice(0, 8)}</h4>
                <p className="text-gray-600 text-sm">{inspection.supplier || '—'}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                inspection.priority === 'critical' ? 'bg-red-100 text-red-800' :
                inspection.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                inspection.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {inspection.priority.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 mb-2">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Supplier:</span>
                <span className="text-sm font-medium">{inspection.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Items:</span>
                <span className="text-sm">{inspection.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Quantity:</span>
                <span className="text-sm">{inspection.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Due Date:</span>
                <span className="text-sm">{inspection.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Risk Level:</span>
                <span className={`text-sm font-medium ${
                  inspection.riskLevel === 'high' ? 'text-red-600' :
                  inspection.riskLevel === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {inspection.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className={`px-2 py-1 rounded-full text-xs ${
                inspection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                inspection.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                inspection.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {inspection.status.replace('_', ' ').toUpperCase()}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewInspection(inspection)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  title="View inspection"
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">View</span>
                </button>
                <button
                  onClick={() => handleRecordResults(inspection)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                  title="Record results"
                >
                  <ClipboardCheck className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Check</span>
                </button>
              </div>
            </div>

            {inspection.inspector && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-600">
                  Inspector: <span className="font-medium">{inspection.inspector}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Inspection Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Inspection Volume</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={qualityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="inspections" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Priority Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { priority: 'Critical', count: 5 },
              { priority: 'High', count: 12 },
              { priority: 'Medium', count: 18 },
              { priority: 'Low', count: 10 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Inspector Performance</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">John Smith</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="text-sm text-gray-600">85%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Jane Doe</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
                <span className="text-sm text-gray-600">92%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Mike Johnson</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="text-sm text-gray-600">78%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-3">
      {/* Templates Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Inspection Templates</h3>
        <button
          onClick={handleCreateTemplate}
          title="Create template"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      {/* Template Categories */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">All Templates</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Electronics</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Materials</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Packaging</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Chemicals</button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {inspectionTemplates.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
            No inspection templates yet. Use “Create Template” to add one.
          </div>
        )}
        {inspectionTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow p-3 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <FileText className="h-10 w-10 text-blue-500" />
              <span className="text-xs text-gray-500">{template.id.slice(0, 8)}</span>
            </div>

            <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
            <p className="text-gray-600 text-sm mb-2">Category: {template.category || '—'}</p>

            <div className="space-y-2 mb-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Checkpoints:</span>
                <span className="font-medium">{template.checkpoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Used:</span>
                <span>{template.lastUsed ? String(template.lastUsed).slice(0, 10) : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Usage:</span>
                <span className="font-medium">{template.usage} times</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleUseTemplate(template)}
                title="Use template"
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm"
              >
                Use Template
              </button>
              <button
                onClick={() => handleEditTemplate(template)}
                title="Edit template"
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Edit3 className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Checklist Preview */}
      <div className="bg-white rounded-lg shadow p-3">
        <h4 className="font-semibold text-lg mb-2">Electronics Inspection Checklist</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <h5 className="font-medium mb-3">Visual Inspection</h5>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Check for physical damage</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Verify component placement</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Inspect solder joints</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Check for contamination</span>
              </label>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-3">Functional Testing</h5>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Power-on test</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Voltage measurements</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Signal integrity check</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Temperature testing</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-3">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {complianceStandards.map((standard, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-3">
            <div className="flex justify-between items-start mb-2">
              <Shield className={`h-8 w-8 ${
                standard.status === 'compliant' ? 'text-green-500' :
                standard.status === 'pending' ? 'text-yellow-500' :
                'text-red-500'
              }`} />
              <span className={`px-2 py-1 rounded-full text-xs ${
                standard.status === 'compliant' ? 'bg-green-100 text-green-800' :
                standard.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {standard.status.toUpperCase()}
              </span>
            </div>

            <h4 className="font-semibold mb-2">{standard.standard}</h4>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Score</span>
                <span className="font-medium">{standard.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    standard.score >= 95 ? 'bg-green-500' :
                    standard.score >= 90 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${standard.score}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Last Audit: {standard.lastAudit}
            </p>
          </div>
        ))}
      </div>

      {/* Compliance Requirements */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Compliance Requirements Tracking</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Requirement</th>
                <th className="text-left py-2">Standard</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Due Date</th>
                <th className="text-left py-2">Evidence</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2">Quality Manual Update</td>
                <td className="py-2">ISO 9001</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Completed
                  </span>
                </td>
                <td className="py-2">2024-12-01</td>
                <td className="py-2">
                  <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    View
                  </button>
                </td>
                <td className="py-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2">Internal Audit</td>
                <td className="py-2">ISO 14001</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    In Progress
                  </span>
                </td>
                <td className="py-2">2024-12-15</td>
                <td className="py-2">
                  <button className="text-gray-400">
                    <Upload className="h-4 w-4" />
                  </button>
                </td>
                <td className="py-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    Update
                  </button>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2">Safety Training Records</td>
                <td className="py-2">OHSAS 18001</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    Pending
                  </span>
                </td>
                <td className="py-2">2024-12-20</td>
                <td className="py-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Upload className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Upload</span>
                  </button>
                </td>
                <td className="py-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    Upload
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Upcoming Audits</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">ISO 9001 Surveillance Audit</p>
                  <p className="text-sm text-gray-600">External Auditor: SGS</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">Jan 15, 2025</p>
                <p className="text-xs text-gray-500">In 30 days</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">Internal Quality Audit</p>
                  <p className="text-sm text-gray-600">Lead: Quality Team</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">Dec 28, 2024</p>
                <p className="text-xs text-gray-500">In 12 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Non-Conformance Tracking */}
        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Non-Conformance Report</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[
              { month: 'Jul', major: 2, minor: 5 },
              { month: 'Aug', major: 1, minor: 4 },
              { month: 'Sep', major: 1, minor: 3 },
              { month: 'Oct', major: 0, minor: 2 },
              { month: 'Nov', major: 1, minor: 2 },
              { month: 'Dec', major: 0, minor: 1 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="major" stroke="#EF4444" name="Major NCR" strokeWidth={2} />
              <Line type="monotone" dataKey="minor" stroke="#F59E0B" name="Minor NCR" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-3">
      {/* Report Generation */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Generate Quality Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Inspection Summary</option>
              <option>Supplier Quality Report</option>
              <option>Defect Analysis</option>
              <option>Compliance Status</option>
              <option>Quality Metrics Dashboard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Format</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
              <option>Word</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerateReport}
          title="Generate report (CSV)"
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Generate Report
        </button>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Report Name</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Generated By</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Size</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2">Monthly Quality Summary Dec 2024</td>
                <td className="py-2">Quality Metrics</td>
                <td className="py-2">John Smith</td>
                <td className="py-2">2024-12-15</td>
                <td className="py-2">2.3 MB</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Download className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Download</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">View</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2">Supplier Quality Report Q4 2024</td>
                <td className="py-2">Supplier Analysis</td>
                <td className="py-2">Jane Doe</td>
                <td className="py-2">2024-12-10</td>
                <td className="py-2">3.1 MB</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Download className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Download</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">View</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2">ISO 9001 Compliance Report</td>
                <td className="py-2">Compliance</td>
                <td className="py-2">Mike Johnson</td>
                <td className="py-2">2024-12-05</td>
                <td className="py-2">1.8 MB</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Download className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Download</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">View</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Metrics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Quality KPI Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-500" />
                <span>First Pass Yield</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">96.5%</p>
                <p className="text-xs text-green-600">↑ 2.3%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-purple-500" />
                <span>Customer Satisfaction</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">4.8/5.0</p>
                <p className="text-xs text-green-600">↑ 0.2</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span>Cost of Quality</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">$45,230</p>
                <p className="text-xs text-red-600">↑ 5.1%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-green-500" />
                <span>Supplier Quality Rating</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">97.2%</p>
                <p className="text-xs text-green-600">↑ 1.8%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold mb-2">Scheduled Reports</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Weekly Quality Summary</p>
                <p className="text-sm text-gray-600">Every Monday, 9:00 AM</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Monthly Supplier Scorecard</p>
                <p className="text-sm text-gray-600">1st of each month</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Quarterly Compliance Report</p>
                <p className="text-sm text-gray-600">End of each quarter</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Plus = ({ className = "" }: { className?: string }) => (
    <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  return (
    <div className="p-6">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Quality Assurance & Inspection</h2>
        <p className="text-gray-600">Ensure product quality and compliance standards</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-3 flex flex-wrap gap-3">
        <button
          onClick={handleCreateInspection}
          title="Create inspection"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ClipboardCheck className="h-5 w-5" />
          Create Inspection
        </button>
        <button
          onClick={() => handleRecordResults()}
          title="Record results"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="h-5 w-5" />
          Record Results
        </button>
        <button
          onClick={() => handleRejectMaterial()}
          title="Reject material"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <XCircle className="h-5 w-5" />
          Reject Material
        </button>
        <button
          onClick={() => handleIssueNCR()}
          title="Issue NCR"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <AlertTriangle className="h-5 w-5" />
          Issue NCR
        </button>
        <button
          onClick={handleTrackTrends}
          title="Track trends"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          Track Trends
        </button>
        <button
          onClick={handleComplianceMonitoring}
          title="Compliance monitoring"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Shield className="h-5 w-5" />
          Compliance
        </button>
      </div>

      {/* Real-Time Monitoring Dashboard */}
      {showRealTimeMonitoring && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-3 border border-indigo-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Real-Time Quality Monitoring
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-refresh
              </label>
              <button
                onClick={() => setShowRealTimeMonitoring(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Active Inspections</span>
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-xs text-green-600 mt-1">↑ 2 in last hour</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pass Rate Today</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">97.2%</div>
              <div className="text-xs text-green-600 mt-1">↑ 0.7% vs yesterday</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Defects Detected</span>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-red-600 mt-1">Critical: 1</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Inspection Time</span>
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">22m</div>
              <div className="text-xs text-green-600 mt-1">↓ 2m faster</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Live Activity Feed</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-600">INS-2024-0456 passed inspection</span>
                <span className="text-gray-400 text-xs ml-auto">2 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-gray-600">Defect detected in batch BATCH-789</span>
                <span className="text-gray-400 text-xs ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ClipboardCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">New inspection INS-2024-0457 created</span>
                <span className="text-gray-400 text-xs ml-auto">8 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-600">Quality check completed for PO-2024-123</span>
                <span className="text-gray-400 text-xs ml-auto">12 min ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI-Powered Insights */}
      {showAIInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-3 border border-purple-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              AI-Powered Quality Insights
            </h3>
            <button
              onClick={() => setShowAIInsights(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Defect Prediction</span>
              </div>
              <div className="text-2xl font-bold text-amber-600 mb-1">18%</div>
              <p className="text-xs text-gray-600">Predicted defect rate for next batch from Tech Components Ltd based on historical trends</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">Quality Trend</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">+2.3%</div>
              <p className="text-xs text-gray-600">Overall quality improvement expected this month with current supplier performance</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-semibold text-gray-900">Risk Alert</span>
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">High</div>
              <p className="text-xs text-gray-600">Chemical Supply Co showing declining quality trends - recommend additional inspection</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Smart Recommendations</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                <Award className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Optimize Inspection Frequency:</span>
                  <span className="text-gray-600"> Reduce inspections for Plastic Solutions (99.1% score) to quarterly - save 12 hours/month</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-purple-50 rounded">
                <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Strengthen Controls:</span>
                  <span className="text-gray-600"> Implement 100% inspection for Chemical Supply Co due to recent quality decline</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-green-50 rounded">
                <Gauge className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Process Improvement:</span>
                  <span className="text-gray-600"> Update Electronics Inspection template - dimensional checks taking 30% longer than standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-3 border-b">
        {['overview', 'inspections', 'templates', 'compliance', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'inspections' && renderInspections()}
      {activeTab === 'templates' && renderTemplates()}
      {activeTab === 'compliance' && renderCompliance()}
      {activeTab === 'reports' && renderReports()}

      {modal && renderModal()}
    </div>
  );

  function renderModal() {
    if (!modal) return null;
    const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
    const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

    let title = '';
    let body: React.ReactNode = null;
    let footer: React.ReactNode = (
      <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
    );

    if (modal.type === 'create-inspection') {
      title = 'Create Inspection';
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>PO Number</label>
            <input className={inputCls} value={inspectionForm.poNumber} onChange={(e) => setInspectionForm({ ...inspectionForm, poNumber: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Supplier</label>
            <input className={inputCls} value={inspectionForm.supplier} onChange={(e) => setInspectionForm({ ...inspectionForm, supplier: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Items</label>
            <input className={inputCls} value={inspectionForm.items} onChange={(e) => setInspectionForm({ ...inspectionForm, items: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Quantity</label>
            <input type="number" className={inputCls} value={inspectionForm.quantity} onChange={(e) => setInspectionForm({ ...inspectionForm, quantity: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Priority</label>
            <select className={inputCls} value={inspectionForm.priority} onChange={(e) => setInspectionForm({ ...inspectionForm, priority: e.target.value })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Risk Level</label>
            <select className={inputCls} value={inspectionForm.riskLevel} onChange={(e) => setInspectionForm({ ...inspectionForm, riskLevel: e.target.value })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Due Date</label>
            <input type="date" className={inputCls} value={inspectionForm.dueDate} onChange={(e) => setInspectionForm({ ...inspectionForm, dueDate: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Template</label>
            <select className={inputCls} value={inspectionForm.templateId} onChange={(e) => setInspectionForm({ ...inspectionForm, templateId: e.target.value })}>
              <option value="">None</option>
              {inspectionTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={submitInspection} disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Creating…' : 'Create Inspection'}
          </button>
        </div>
      );
    } else if (modal.type === 'record-results') {
      const ins = modal.inspection;
      title = `Record Results — ${ins.poNumber || ins.id.slice(0, 8)}`;
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Result</label>
            <select className={inputCls} value={resultsForm.result} onChange={(e) => setResultsForm({ ...resultsForm, result: e.target.value })}>
              <option value="pass">Pass</option><option value="fail">Fail</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Defects Found</label>
            <input type="number" className={inputCls} value={resultsForm.defectsFound} onChange={(e) => setResultsForm({ ...resultsForm, defectsFound: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Inspector</label>
            <input className={inputCls} value={resultsForm.inspector} onChange={(e) => setResultsForm({ ...resultsForm, inspector: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Notes</label>
            <textarea className={inputCls} rows={3} value={resultsForm.resultNotes} onChange={(e) => setResultsForm({ ...resultsForm, resultNotes: e.target.value })} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => submitResults(ins)} disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
            {submitting ? 'Saving…' : 'Record Results'}
          </button>
        </div>
      );
    } else if (modal.type === 'reject') {
      const ins = modal.inspection;
      title = `Reject Material — ${ins.poNumber || ins.id.slice(0, 8)}`;
      body = (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Supplier: {ins.supplier || '—'} · Items: {ins.items || '—'}</p>
          <div>
            <label className={labelCls}>Rejection Reason *</label>
            <textarea className={inputCls} rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => submitReject(ins)} disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
            {submitting ? 'Rejecting…' : 'Reject Material'}
          </button>
        </div>
      );
    } else if (modal.type === 'view-inspection') {
      const ins = modal.inspection;
      title = `Inspection — ${ins.poNumber || ins.id.slice(0, 8)}`;
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-gray-500">Supplier:</span> <span className="font-medium">{ins.supplier || '—'}</span></div>
          <div><span className="text-gray-500">Items:</span> <span className="font-medium">{ins.items || '—'}</span></div>
          <div><span className="text-gray-500">Quantity:</span> <span className="font-medium">{ins.quantity}</span></div>
          <div><span className="text-gray-500">Priority:</span> <span className="font-medium">{ins.priority}</span></div>
          <div><span className="text-gray-500">Status:</span> <span className="font-medium">{ins.status}</span></div>
          <div><span className="text-gray-500">Risk Level:</span> <span className="font-medium">{ins.riskLevel}</span></div>
          <div><span className="text-gray-500">Result:</span> <span className="font-medium">{ins.result ?? '—'}</span></div>
          <div><span className="text-gray-500">Defects:</span> <span className="font-medium">{ins.defectsFound ?? '—'}</span></div>
          <div><span className="text-gray-500">Inspector:</span> <span className="font-medium">{ins.inspector ?? '—'}</span></div>
          <div><span className="text-gray-500">Due Date:</span> <span className="font-medium">{ins.dueDate ?? '—'}</span></div>
          {ins.rejectionReason && <div className="md:col-span-2"><span className="text-gray-500">Rejection:</span> <span className="font-medium">{ins.rejectionReason}</span></div>}
          {ins.resultNotes && <div className="md:col-span-2"><span className="text-gray-500">Notes:</span> <span className="font-medium">{ins.resultNotes}</span></div>}
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={() => { const i = ins; closeModal(); handleRecordResults(i); }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Record Results</button>
          <button onClick={() => { const i = ins; closeModal(); handleRejectMaterial(i); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Reject</button>
          <button onClick={() => { const i = ins; closeModal(); handleIssueNCR(i); }} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">Issue NCR</button>
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
        </div>
      );
    } else if (modal.type === 'issue-ncr') {
      const ins = modal.inspection;
      title = 'Issue Non-Conformance Report';
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className={labelCls}>Title *</label>
            <input className={inputCls} value={ncrForm.title} onChange={(e) => setNcrForm({ ...ncrForm, title: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Severity</label>
            <select className={inputCls} value={ncrForm.severity} onChange={(e) => setNcrForm({ ...ncrForm, severity: e.target.value })}>
              <option value="minor">Minor</option><option value="major">Major</option><option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Supplier</label>
            <input className={inputCls} value={ncrForm.supplier} onChange={(e) => setNcrForm({ ...ncrForm, supplier: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={2} value={ncrForm.description} onChange={(e) => setNcrForm({ ...ncrForm, description: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Root Cause</label>
            <textarea className={inputCls} rows={2} value={ncrForm.rootCause} onChange={(e) => setNcrForm({ ...ncrForm, rootCause: e.target.value })} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => submitNcr(ins)} disabled={submitting} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50">
            {submitting ? 'Issuing…' : 'Issue NCR'}
          </button>
        </div>
      );
    } else if (modal.type === 'create-template' || modal.type === 'edit-template') {
      const editing = modal.type === 'edit-template';
      title = editing ? 'Edit Template' : 'Create Template';
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className={labelCls}>Name *</label>
            <input className={inputCls} value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input className={inputCls} value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Checkpoints</label>
            <input type="number" className={inputCls} value={templateForm.checkpoints} onChange={(e) => setTemplateForm({ ...templateForm, checkpoints: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={2} value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => (editing ? submitEditTemplate(modal.template) : submitCreateTemplate())}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      );
    } else if (modal.type === 'track-trends') {
      title = 'Quality Trends';
      body = (
        <div className="space-y-3 text-sm">
          {qualityTrends.length === 0 ? (
            <p className="text-gray-500">No trend data available.</p>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b text-left text-gray-600"><th className="py-2 pr-3">Month</th><th className="py-2 pr-3">Pass Rate</th><th className="py-2 pr-3">Defect Rate</th><th className="py-2 pr-3">Inspections</th></tr></thead>
              <tbody>
                {qualityTrends.map((t) => (
                  <tr key={t.month} className="border-b"><td className="py-2 pr-3">{t.month}</td><td className="py-2 pr-3">{t.passRate}%</td><td className="py-2 pr-3">{t.defectRate}%</td><td className="py-2 pr-3">{t.inspections}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="pt-2 border-t">
            <div className="font-medium mb-1">Recent NCRs ({ncrs.length})</div>
            {ncrs.length === 0 ? <p className="text-gray-500">No NCRs raised.</p> : (
              <ul className="list-disc pl-5">{ncrs.slice(0, 5).map((n) => <li key={n.id}>{n.ncrNumber} — {n.title} ({n.severity})</li>)}</ul>
            )}
          </div>
        </div>
      );
    } else if (modal.type === 'supplier-report') {
      const sup = supplierQualityScores.find((s) => s.supplier === modal.supplierName);
      title = `Supplier Report — ${modal.supplierName}`;
      body = sup ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-gray-500">Quality Score:</span> <span className="font-medium">{sup.score}%</span></div>
          <div><span className="text-gray-500">Trend:</span> <span className="font-medium">{sup.trend}</span></div>
          <div><span className="text-gray-500">Inspections:</span> <span className="font-medium">{sup.inspections}</span></div>
          <div className="md:col-span-2 pt-2 border-t">
            <div className="font-medium mb-1">NCRs for this supplier</div>
            {ncrs.filter((n) => n.supplier === modal.supplierName).length === 0 ? (
              <p className="text-gray-500">No NCRs on record.</p>
            ) : (
              <ul className="list-disc pl-5">{ncrs.filter((n) => n.supplier === modal.supplierName).map((n) => <li key={n.id}>{n.title} ({n.severity})</li>)}</ul>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No score data for this supplier.</p>
      );
    } else if (modal.type === 'compliance-monitoring') {
      title = 'Compliance Monitoring';
      body = (
        <div className="space-y-3 text-sm">
          {complianceStandards.length === 0 ? (
            <p className="text-gray-500">No compliance standards loaded.</p>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b text-left text-gray-600"><th className="py-2 pr-3">Standard</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Score</th><th className="py-2 pr-3">Last Audit</th></tr></thead>
              <tbody>
                {complianceStandards.map((s) => (
                  <tr key={s.standard} className="border-b"><td className="py-2 pr-3">{s.standard}</td><td className="py-2 pr-3">{s.status}</td><td className="py-2 pr-3">{s.score}%</td><td className="py-2 pr-3">{s.lastAudit}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <div className="px-5 py-4">
            {formError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</div>
            )}
            {body}
          </div>
          <div className="px-5 py-3 border-t flex justify-end">{footer}</div>
        </div>
      </div>
    );
  }
};

export default QualityAssurance;