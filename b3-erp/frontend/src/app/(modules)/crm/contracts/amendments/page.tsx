'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, CheckCircle, XCircle, Clock, AlertCircle, FileText, DollarSign, Calendar, User, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { crmService, asArray } from '@/services/crm.service';

interface ContractAmendment {
  id: string;
  amendmentNumber: string;
  contractNumber: string;
  contractTitle: string;
  customer: string;
  customerCompany: string;
  amendmentType: 'value_change' | 'scope_change' | 'term_extension' | 'term_reduction' | 'pricing_adjustment' | 'service_modification';
  status: 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'rejected' | 'executed';
  description: string;
  originalValue?: number;
  newValue?: number;
  valueImpact?: number;
  originalEndDate?: string;
  newEndDate?: string;
  effectiveDate: string;
  requestedDate: string;
  approvedDate?: string;
  executedDate?: string;
  requestedBy: string;
  approverName?: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  impactedClauses: string[];
  requiresLegalReview: boolean;
  requiresCustomerApproval: boolean;
  customerApprovalStatus?: 'pending' | 'approved' | 'rejected';
  internalApprovalStatus?: 'pending' | 'approved' | 'rejected';
  tags: string[];
  attachments: number;
  notes: string;
}

export default function ContractAmendmentsPage() {
  const router = useRouter();
  const [amendments, setAmendments] = useState<ContractAmendment[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await crmService.contractAmendments.getAll();
        if (!active) return;
        const rows = asArray<any>(data);
        setAmendments(
          rows.map((a: any) => ({
            id: String(a?.id ?? ''),
            amendmentNumber: a?.amendmentNumber ?? '',
            contractNumber: a?.contractNumber ?? '',
            contractTitle: a?.contractTitle ?? '',
            customer: a?.customer ?? '',
            customerCompany: a?.customerCompany ?? '',
            amendmentType: (a?.amendmentType ?? 'value_change') as ContractAmendment['amendmentType'],
            status: (a?.status ?? 'draft') as ContractAmendment['status'],
            description: a?.description ?? '',
            originalValue: a?.originalValue != null ? Number(a.originalValue) : undefined,
            newValue: a?.newValue != null ? Number(a.newValue) : undefined,
            valueImpact: a?.valueImpact != null ? Number(a.valueImpact) : undefined,
            originalEndDate: a?.originalEndDate ?? undefined,
            newEndDate: a?.newEndDate ?? undefined,
            effectiveDate: a?.effectiveDate ?? '',
            requestedDate: a?.requestedDate ?? '',
            approvedDate: a?.approvedDate ?? undefined,
            executedDate: a?.executedDate ?? undefined,
            requestedBy: a?.requestedBy ?? '',
            approverName: a?.approverName ?? undefined,
            assignedTo: a?.assignedTo ?? '',
            priority: (a?.priority ?? 'medium') as ContractAmendment['priority'],
            reason: a?.reason ?? '',
            impactedClauses: Array.isArray(a?.impactedClauses) ? a.impactedClauses : [],
            requiresLegalReview: Boolean(a?.requiresLegalReview),
            requiresCustomerApproval: Boolean(a?.requiresCustomerApproval),
            customerApprovalStatus: a?.customerApprovalStatus ?? undefined,
            internalApprovalStatus: a?.internalApprovalStatus ?? undefined,
            tags: Array.isArray(a?.tags) ? a.tags : [],
            attachments: Number(a?.attachments ?? 0),
            notes: a?.notes ?? '',
          })),
        );
      } catch (err) {
        console.error('Failed to load amendments', err);
        if (active) setAmendments([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'rejected' | 'executed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'value_change' | 'scope_change' | 'term_extension' | 'term_reduction' | 'pricing_adjustment' | 'service_modification'>('all');

  const handleCreateAmendment = () => {
    router.push('/crm/contracts/amendments/create');
  };

  const filteredAmendments = amendments.filter(amendment => {
    const matchesSearch = amendment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amendment.amendmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amendment.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amendment.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amendment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || amendment.status === filterStatus;
    const matchesType = filterType === 'all' || amendment.amendmentType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    totalAmendments: amendments.length,
    pendingApproval: amendments.filter(a => a.status === 'pending_approval' || a.status === 'pending_review').length,
    approved: amendments.filter(a => a.status === 'approved').length,
    executed: amendments.filter(a => a.status === 'executed').length,
    totalValueImpact: amendments.filter(a => a.status !== 'rejected' && a.valueImpact).reduce((sum, a) => sum + (a.valueImpact || 0), 0),
    criticalCount: amendments.filter(a => a.priority === 'critical' && a.status !== 'executed' && a.status !== 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'pending_review': return 'bg-blue-100 text-blue-700';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'executed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'pending_review': return <Clock className="w-4 h-4" />;
      case 'pending_approval': return <AlertCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'executed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'value_change': return 'bg-green-100 text-green-700';
      case 'scope_change': return 'bg-blue-100 text-blue-700';
      case 'term_extension': return 'bg-purple-100 text-purple-700';
      case 'term_reduction': return 'bg-orange-100 text-orange-700';
      case 'pricing_adjustment': return 'bg-teal-100 text-teal-700';
      case 'service_modification': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="mb-8">
        <div className="flex justify-end mb-3">
          <button
            onClick={handleCreateAmendment}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Amendment
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <FileText className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalAmendments}</div>
            <div className="text-blue-100 text-sm">Total Amendments</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 text-white">
            <AlertCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.pendingApproval}</div>
            <div className="text-yellow-100 text-sm">Pending Approval</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.approved}</div>
            <div className="text-green-100 text-sm">Approved</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.executed}</div>
            <div className="text-purple-100 text-sm">Executed</div>
          </div>

          <div className={`bg-gradient-to-br rounded-lg p-3 text-white ${
            stats.totalValueImpact >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
          }`}>
            <DollarSign className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">
              {stats.totalValueImpact >= 0 ? '+' : ''}${(Math.abs(stats.totalValueImpact) / 1000).toFixed(0)}K
            </div>
            <div className={`text-sm ${stats.totalValueImpact >= 0 ? 'text-green-100' : 'text-red-100'}`}>
              Value Impact
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
            <AlertCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.criticalCount}</div>
            <div className="text-red-100 text-sm">Critical Priority</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search amendments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="executed">Executed</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="value_change">Value Change</option>
              <option value="scope_change">Scope Change</option>
              <option value="term_extension">Term Extension</option>
              <option value="term_reduction">Term Reduction</option>
              <option value="pricing_adjustment">Pricing Adjustment</option>
              <option value="service_modification">Service Modification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Amendments List */}
      <div className="space-y-2">
        {filteredAmendments.map((amendment) => (
          <div
            key={amendment.id}
            className={`bg-white rounded-lg border p-3 hover:shadow-md transition-shadow ${
              amendment.priority === 'critical' ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{amendment.description}</h3>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(amendment.status)}`}>
                    {getStatusIcon(amendment.status)}
                    {amendment.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(amendment.amendmentType)}`}>
                    {amendment.amendmentType.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(amendment.priority)}`}>
                    {amendment.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{amendment.amendmentNumber}</span>
                  <span>•</span>
                  <span>Contract: {amendment.contractNumber}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {amendment.customerCompany}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-2">
              {/* Value Impact */}
              {amendment.valueImpact !== undefined && (
                <div className={`bg-gradient-to-br rounded-lg p-3 ${
                  amendment.valueImpact > 0
                    ? 'from-green-50 to-green-100'
                    : amendment.valueImpact < 0
                    ? 'from-red-50 to-red-100'
                    : 'from-gray-50 to-gray-100'
                }`}>
                  <div className={`flex items-center gap-1 mb-1 ${
                    amendment.valueImpact > 0 ? 'text-green-700' : amendment.valueImpact < 0 ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    {amendment.valueImpact > 0 ? <TrendingUp className="w-4 h-4" /> : amendment.valueImpact < 0 ? <TrendingDown className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                    <span className="text-xs font-medium">Value Impact</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    amendment.valueImpact > 0 ? 'text-green-900' : amendment.valueImpact < 0 ? 'text-red-900' : 'text-gray-900'
                  }`}>
                    {amendment.valueImpact > 0 && '+'}${(Math.abs(amendment.valueImpact) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {amendment.originalValue && amendment.newValue && (
                      <span>
                        ${(amendment.originalValue / 1000).toFixed(0)}K → ${(amendment.newValue / 1000).toFixed(0)}K
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Term Change */}
              {amendment.originalEndDate && amendment.newEndDate && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-purple-700 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Term Change</span>
                  </div>
                  <div className="text-sm font-bold text-purple-900">
                    {new Date(amendment.originalEndDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-purple-700">
                    → {new Date(amendment.newEndDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              )}

              {/* Effective Date */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="flex items-center gap-1 text-blue-700 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Effective Date</span>
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {new Date(amendment.effectiveDate).toLocaleDateString()}
                </div>
              </div>

              {/* Approval Status */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                <div className="flex items-center gap-1 text-orange-700 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Approvals</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${
                      amendment.internalApprovalStatus === 'approved' ? 'bg-green-500' :
                      amendment.internalApprovalStatus === 'rejected' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></span>
                    <span className="text-gray-700">Internal</span>
                  </div>
                  {amendment.requiresCustomerApproval && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${
                        amendment.customerApprovalStatus === 'approved' ? 'bg-green-500' :
                        amendment.customerApprovalStatus === 'rejected' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}></span>
                      <span className="text-gray-700">Customer</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned To */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3">
                <div className="flex items-center gap-1 text-teal-700 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium">Assigned To</span>
                </div>
                <div className="text-sm font-medium text-teal-900">{amendment.assignedTo}</div>
                <div className="text-xs text-teal-700">{amendment.attachments} attachments</div>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-2 pb-4 border-b border-gray-100">
              <div className="text-xs text-gray-600 mb-1">Reason:</div>
              <div className="text-sm text-gray-900">{amendment.reason}</div>
            </div>

            {/* Impacted Clauses */}
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-2">Impacted Clauses ({amendment.impactedClauses.length}):</div>
              <div className="flex flex-wrap gap-2">
                {amendment.impactedClauses.map((clause, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                    {clause}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-2 mb-2 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${amendment.requiresLegalReview ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
                <span className="text-xs text-gray-700">Requires Legal Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${amendment.requiresCustomerApproval ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
                <span className="text-xs text-gray-700">Requires Customer Approval</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-4 gap-2 mb-2 text-xs">
              <div>
                <span className="text-gray-600">Requested:</span>
                <div className="font-medium text-gray-900">{new Date(amendment.requestedDate).toLocaleDateString()}</div>
                <div className="text-gray-600">by {amendment.requestedBy}</div>
              </div>
              {amendment.approvedDate && (
                <div>
                  <span className="text-gray-600">Approved:</span>
                  <div className="font-medium text-gray-900">{new Date(amendment.approvedDate).toLocaleDateString()}</div>
                  {amendment.approverName && <div className="text-gray-600">by {amendment.approverName}</div>}
                </div>
              )}
              {amendment.executedDate && (
                <div>
                  <span className="text-gray-600">Executed:</span>
                  <div className="font-medium text-gray-900">{new Date(amendment.executedDate).toLocaleDateString()}</div>
                </div>
              )}
            </div>

            {/* Notes */}
            {amendment.notes && (
              <div className="mb-2">
                <div className="text-xs text-gray-600 mb-1">Notes:</div>
                <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 border border-gray-200">
                  {amendment.notes}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {amendment.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredAmendments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No amendments found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
