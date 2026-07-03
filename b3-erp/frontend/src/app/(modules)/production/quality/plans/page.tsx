'use client';

import React, { useState, useEffect } from 'react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Plus, Filter, CheckCircle, FileText, Calendar, TrendingUp, AlertCircle, Edit } from 'lucide-react';
import { CreateQualityPlanModal, EditQualityPlanModal, ApproveQualityPlanModal } from '@/components/quality/QualityPlanModals';
import { ExportQualityPlansModal } from '@/components/quality/QualityExportModals';
import { exportToCsv } from '@/lib/export';

interface QualityPlan {
  id: string;
  planNumber: string;
  planName: string;
  productCode: string;
  productName: string;
  category: string;
  version: string;
  status: 'active' | 'draft' | 'archived' | 'under-review';
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  approvedBy: string | null;
  approvalDate: string | null;
  inspectionPoints: InspectionPoint[];
  acceptanceCriteria: string[];
  testingFrequency: string;
  samplingSize: number;
  qualityStandard: string;
}

interface InspectionPoint {
  id: string;
  stage: string;
  parameter: string;
  specification: string;
  measuringTool: string;
  tolerance: string;
  critical: boolean;
}

export default function QualityPlansPage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Modal state hooks
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<QualityPlan | null>(null);

  // Mock data for quality plans
  const [qualityPlans, setQualityPlans] = useState<QualityPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getQualityPlans()) as any[];
        const mapped = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => ({
          ...d,
          id: String(d?.id ?? i),
        })) as unknown as QualityPlan[];
        if (!cancelled) setQualityPlans(mapped);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message ?? 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredPlans = qualityPlans.filter(plan => {
    const categoryMatch = filterCategory === 'all' || plan.category === filterCategory;
    const statusMatch = filterStatus === 'all' || plan.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const totalPlans = qualityPlans.length;
  const activePlans = qualityPlans.filter(p => p.status === 'active').length;
  const draftPlans = qualityPlans.filter(p => p.status === 'draft').length;
  const underReviewPlans = qualityPlans.filter(p => p.status === 'under-review').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'draft': return 'text-gray-700 bg-gray-100';
      case 'archived': return 'text-orange-700 bg-orange-100';
      case 'under-review': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Handler functions
  const handleCreate = () => {
    setIsCreateOpen(true);
  };

  const handleEdit = (plan: QualityPlan) => {
    setSelectedPlanForModal(plan);
    setIsEditOpen(true);
  };

  const handleApprove = (plan: QualityPlan) => {
    setSelectedPlanForModal(plan);
    setIsApproveOpen(true);
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleCreateSubmit = (data: any, saveType: 'draft' | 'review') => {
    // TODO: Implement API call to create quality plan
    console.log('Creating quality plan:', data, saveType);
    // API Call example:
    // await createQualityPlan(data, saveType);
    // Refresh data after successful creation
  };

  const handleEditSubmit = (data: any, saveType: 'draft' | 'review' | 'activate') => {
    // TODO: Implement API call to update quality plan
    console.log('Updating quality plan:', data, saveType);
    // API Call example:
    // await updateQualityPlan(selectedPlanForModal?.id, data, saveType);
    // Refresh data after successful update
  };

  const handleApproveSubmit = (decision: 'approve' | 'reject' | 'request_changes', comments: string, effectiveDate?: string, signature?: string) => {
    // TODO: Implement API call to approve/reject quality plan
    console.log('Quality plan decision:', { decision, comments, effectiveDate, signature });
    // API Call example:
    // await approveQualityPlan(selectedPlanForModal?.id, { decision, comments, effectiveDate, signature });
    // Refresh data after successful approval/rejection
  };

  const handleExportSubmit = (_data: any) => {
    exportToCsv('quality-plans', filteredPlans as unknown as Record<string, unknown>[]);
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
            <h1 className="text-2xl font-bold text-gray-900">Quality Control Plans</h1>
            <p className="text-sm text-gray-500 mt-1">Manage inspection and quality assurance plans</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
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
              <p className="text-sm font-medium text-blue-600">Total Plans</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalPlans}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <FileText className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Plans</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{activePlans}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Under Review</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{underReviewPlans}</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft Plans</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{draftPlans}</p>
            </div>
            <div className="p-3 bg-gray-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Kitchen Sinks">Kitchen Sinks</option>
            <option value="Kitchen Faucets">Kitchen Faucets</option>
            <option value="Cookware">Cookware</option>
            <option value="Kitchen Cabinets">Kitchen Cabinets</option>
            <option value="Kitchen Appliances">Kitchen Appliances</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="under-review">Under Review</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Quality Plans Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Standard</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Points</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-blue-600">{plan.planNumber}</div>
                      <div className="text-sm text-gray-500">{plan.planName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{plan.productCode}</div>
                      <div className="text-sm text-gray-500">{plan.productName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{plan.category}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-gray-900">v{plan.version}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm text-gray-700">{plan.qualityStandard}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                      {plan.inspectionPoints.length} points
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {plan.lastUpdated}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedPlan(plan.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleEdit(plan)}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      {plan.status === 'under-review' && (
                        <button
                          onClick={() => handleApprove(plan)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50" onClick={() => setSelectedPlan(null)}>
          <div className="bg-white rounded-xl p-3 w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const plan = qualityPlans.find(p => p.id === selectedPlan);
              if (!plan) return null;

              return (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.planNumber}</h3>
                      <p className="text-gray-600">{plan.planName}</p>
                    </div>
                    <button onClick={() => setSelectedPlan(null)} className="text-gray-400 hover:text-gray-600">
                      <span className="text-3xl">&times;</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Product</p>
                      <p className="text-lg font-bold text-blue-900">{plan.productCode}</p>
                      <p className="text-xs text-gray-600">{plan.productName}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Version</p>
                      <p className="text-lg font-bold text-green-900">v{plan.version}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600">Inspection Points</p>
                      <p className="text-lg font-bold text-purple-900">{plan.inspectionPoints.length}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600">Sampling Size</p>
                      <p className="text-lg font-bold text-orange-900">{plan.samplingSize}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Inspection Points</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Specification</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tool</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tolerance</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Critical</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {plan.inspectionPoints.map((point) => (
                            <tr key={point.id} className={point.critical ? 'bg-red-50' : ''}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">{point.stage}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{point.parameter}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{point.specification}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{point.measuringTool}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{point.tolerance}</td>
                              <td className="px-4 py-2 text-center">
                                {point.critical ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    Critical
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Acceptance Criteria</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {plan.acceptanceCriteria.map((criteria, idx) => (
                        <li key={idx} className="text-sm text-gray-700">{criteria}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Testing Frequency</p>
                      <p className="text-sm font-semibold text-gray-900">{plan.testingFrequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quality Standard</p>
                      <p className="text-sm font-semibold text-gray-900">{plan.qualityStandard}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="text-sm font-semibold text-gray-900">{plan.createdBy}</p>
                    </div>
                    {plan.approvedBy && (
                      <div>
                        <p className="text-sm text-gray-500">Approved By</p>
                        <p className="text-sm font-semibold text-gray-900">{plan.approvedBy} on {plan.approvalDate}</p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal Components */}
      <CreateQualityPlanModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateSubmit}
      />

      <EditQualityPlanModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedPlanForModal(null);
        }}
        onSave={handleEditSubmit}
        plan={selectedPlanForModal as any}
      />

      <ApproveQualityPlanModal
        isOpen={isApproveOpen}
        onClose={() => {
          setIsApproveOpen(false);
          setSelectedPlanForModal(null);
        }}
        onApprove={handleApproveSubmit}
        plan={selectedPlanForModal as any}
      />

      <ExportQualityPlansModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  );
}
