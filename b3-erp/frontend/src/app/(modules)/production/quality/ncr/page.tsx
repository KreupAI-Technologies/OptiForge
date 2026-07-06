'use client';

import React, { useState, useEffect } from 'react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Plus, Filter, AlertTriangle, CheckCircle, Clock, XCircle, FileText, User, Eye, Edit } from 'lucide-react';
import { RaiseNCRModal, ViewNCRDetailsModal, EditNCRModal } from '@/components/quality/NCRModals';
import { ExportNCRModal } from '@/components/quality/QualityExportModals';
import { exportToCsv } from '@/lib/export';

interface NCR {
  id: string;
  ncrNumber: string;
  title: string;
  productCode: string;
  productName: string;
  workOrder: string;
  lotNumber: string;
  quantityAffected: number;
  detectedBy: string;
  detectedDate: string;
  detectedStage: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'under-investigation' | 'corrective-action' | 'closed' | 'rejected';
  nonconformanceType: 'dimensional' | 'material' | 'visual' | 'functional' | 'safety' | 'packaging';
  description: string;
  rootCause: string | null;
  correctiveAction: string | null;
  preventiveAction: string | null;
  assignedTo: string;
  targetCloseDate: string;
  actualCloseDate: string | null;
  costImpact: number;
  customerImpact: boolean;
  attachments: string[];
  approvedBy: string | null;
  verifiedBy: string | null;
}

export default function NCRPage() {
  const router = useRouter();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Modal state hooks
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedNCR, setSelectedNCR] = useState<NCR | null>(null);

  // Mock data for NCRs
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadNcrs = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = (await ProductionOrphanService.getNcrs()) as any;
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      const mapped = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => ({
        ...d,
        id: String(d?.id ?? d?.ncrNumber ?? i),
      })) as unknown as NCR[];
      setNcrs(mapped);
    } catch (err: any) {
      setLoadError(err?.message ?? 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNcrs();
  }, []);

  const filteredNCRs = ncrs.filter(ncr => {
    const severityMatch = filterSeverity === 'all' || ncr.severity === filterSeverity;
    const statusMatch = filterStatus === 'all' || ncr.status === filterStatus;
    const typeMatch = filterType === 'all' || ncr.nonconformanceType === filterType;
    return severityMatch && statusMatch && typeMatch;
  });

  const totalNCRs = ncrs.length;
  const openNCRs = ncrs.filter(n => n.status === 'open' || n.status === 'under-investigation' || n.status === 'corrective-action').length;
  const criticalNCRs = ncrs.filter(n => n.severity === 'critical').length;
  const closedNCRs = ncrs.filter(n => n.status === 'closed').length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'major': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'minor': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-700 bg-red-100';
      case 'under-investigation': return 'text-blue-700 bg-blue-100';
      case 'corrective-action': return 'text-yellow-700 bg-yellow-100';
      case 'closed': return 'text-green-700 bg-green-100';
      case 'rejected': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dimensional': return 'text-blue-700 bg-blue-50';
      case 'material': return 'text-purple-700 bg-purple-50';
      case 'visual': return 'text-green-700 bg-green-50';
      case 'functional': return 'text-orange-700 bg-orange-50';
      case 'safety': return 'text-red-700 bg-red-50';
      case 'packaging': return 'text-yellow-700 bg-yellow-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-5 h-5" />;
      case 'under-investigation': return <Clock className="w-5 h-5" />;
      case 'corrective-action': return <FileText className="w-5 h-5" />;
      case 'closed': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // Handler functions
  const handleRaise = () => {
    setIsRaiseOpen(true);
  };

  const handleView = (ncr: NCR) => {
    // Convert NCR format for modal compatibility
    const modalNCR = convertNCRForModal(ncr);
    setSelectedNCR(modalNCR as any);
    setIsViewOpen(true);
  };

  const handleEdit = (ncr: NCR) => {
    // Convert NCR format for modal compatibility
    const modalNCR = convertNCRForModal(ncr);
    setSelectedNCR(modalNCR as any);
    setIsEditOpen(true);
  };

  // Helper function to convert NCR format for modal compatibility
  const convertNCRForModal = (ncr: NCR): any => {
    return {
      ...ncr,
      severity: ncr.severity.charAt(0).toUpperCase() + ncr.severity.slice(1),
      status: ncr.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      detectionDate: ncr.detectedDate,
      detectionStage: ncr.detectedStage,
      createdDate: ncr.detectedDate,
      lastModified: ncr.detectedDate,
    };
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleRaiseSubmit = async (data: any) => {
    try {
      await ProductionOrphanService.createNcr(data);
      await loadNcrs();
    } catch (err) {
      console.error('Failed to create NCR:', err);
    } finally {
      setIsRaiseOpen(false);
    }
  };

  const handleViewClose = () => {
    setIsViewOpen(false);
    setSelectedNCR(null);
  };

  const handleEditSubmit = async (data: any) => {
    const id = selectedNCR?.id ?? data?.id;
    try {
      if (id) await ProductionOrphanService.updateNcr(String(id), data);
      await loadNcrs();
    } catch (err) {
      console.error('Failed to update NCR:', err);
    } finally {
      setIsEditOpen(false);
      setSelectedNCR(null);
    }
  };

  const handleExportSubmit = (_data: any) => {
    exportToCsv('quality-ncrs', filteredNCRs as unknown as Record<string, unknown>[]);
    setIsExportOpen(false);
  };

  const handleCloseNCR = async (ncrId: string) => {
    try {
      if (ncrId) await ProductionOrphanService.updateNcr(String(ncrId), { status: 'closed' });
      await loadNcrs();
    } catch (err) {
      console.error('Failed to close NCR:', err);
    } finally {
      setIsViewOpen(false);
      setSelectedNCR(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {/* Inline Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Non-Conformance Reports (NCR)</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage quality non-conformances</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRaise}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Raise NCR</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total NCRs</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalNCRs}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <FileText className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Open NCRs</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{openNCRs}</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical NCRs</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{criticalNCRs}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Closed NCRs</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{closedNCRs}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="under-investigation">Under Investigation</option>
            <option value="corrective-action">Corrective Action</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="dimensional">Dimensional</option>
            <option value="material">Material</option>
            <option value="visual">Visual</option>
            <option value="functional">Functional</option>
            <option value="safety">Safety</option>
            <option value="packaging">Packaging</option>
          </select>
        </div>
      </div>

      {/* NCR List */}
      <div className="space-y-2">
        {filteredNCRs.map((ncr) => (
          <div key={ncr.id} className={`bg-white rounded-xl border-2 p-3 hover:shadow-lg transition-shadow ${getSeverityColor(ncr.severity)}`}>
            <div className="flex items-start gap-2">
              {/* Icon */}
              <div className={`p-3 rounded-lg ${getStatusColor(ncr.status)}`}>
                {getStatusIcon(ncr.status)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{ncr.ncrNumber}</h3>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(ncr.severity)}`}>
                        {ncr.severity}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ncr.status)}`}>
                        {ncr.status}
                      </span>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(ncr.nonconformanceType)}`}>
                        {ncr.nonconformanceType}
                      </span>
                      {ncr.customerImpact && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" />
                          Customer Impact
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">{ncr.title}</p>
                    <p className="text-gray-700 mb-3">{ncr.description}</p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                      <div>
                        <p className="text-gray-500">Product</p>
                        <p className="font-semibold text-gray-900">{ncr.productCode}</p>
                        <p className="text-xs text-gray-600">{ncr.productName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Work Order / Lot</p>
                        <p className="font-semibold text-blue-600">{ncr.workOrder}</p>
                        <p className="text-xs text-gray-600">{ncr.lotNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Quantity Affected</p>
                        <p className="font-semibold text-red-600">{ncr.quantityAffected} units</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cost Impact</p>
                        <p className="font-semibold text-orange-600">₹{ncr.costImpact.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Detected By
                        </p>
                        <p className="font-semibold text-gray-900">{ncr.detectedBy}</p>
                        <p className="text-xs text-gray-600">{ncr.detectedDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Detection Stage</p>
                        <p className="font-semibold text-gray-900">{ncr.detectedStage}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Assigned To</p>
                        <p className="font-semibold text-gray-900">{ncr.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Target Close Date</p>
                        <p className="font-semibold text-gray-900">{ncr.targetCloseDate}</p>
                        {ncr.actualCloseDate && (
                          <p className="text-xs text-green-600">Closed: {ncr.actualCloseDate}</p>
                        )}
                      </div>
                    </div>

                    {/* Root Cause & Actions */}
                    {(ncr.rootCause || ncr.correctiveAction || ncr.preventiveAction) && (
                      <div className="space-y-2">
                        {ncr.rootCause && (
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-semibold text-yellow-800 mb-1">Root Cause</p>
                            <p className="text-sm text-gray-700">{ncr.rootCause}</p>
                          </div>
                        )}
                        {ncr.correctiveAction && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-semibold text-blue-800 mb-1">Corrective Action</p>
                            <p className="text-sm text-gray-700">{ncr.correctiveAction}</p>
                          </div>
                        )}
                        {ncr.preventiveAction && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-semibold text-green-800 mb-1">Preventive Action</p>
                            <p className="text-sm text-gray-700">{ncr.preventiveAction}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Approval/Verification */}
                    {(ncr.approvedBy || ncr.verifiedBy) && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        {ncr.approvedBy && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Approved by {ncr.approvedBy}</span>
                          </div>
                        )}
                        {ncr.verifiedBy && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Verified by {ncr.verifiedBy}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleView(ncr)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                {ncr.status !== 'closed' && ncr.status !== 'rejected' && (
                  <button
                    onClick={() => handleEdit(ncr)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Components */}
      <RaiseNCRModal
        isOpen={isRaiseOpen}
        onClose={() => setIsRaiseOpen(false)}
        onSave={handleRaiseSubmit}
      />

      <ViewNCRDetailsModal
        isOpen={isViewOpen}
        onClose={handleViewClose}
        ncr={selectedNCR as any}
        onEdit={(ncr) => handleEdit(ncr as any)}
        onCloseNCR={handleCloseNCR}
      />

      <EditNCRModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEditSubmit}
        ncr={selectedNCR as any}
      />

      <ExportNCRModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  );
}
