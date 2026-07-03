'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Download, FileText, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, TrendingUp, User, Building2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { crmService } from '@/services/crm.service';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  customer: string;
  customerCompany: string;
  type: 'service' | 'subscription' | 'license' | 'support' | 'maintenance' | 'custom';
  status: 'draft' | 'active' | 'pending_renewal' | 'expired' | 'terminated' | 'suspended';
  value: number;
  recurringValue?: number;
  billingCycle?: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  startDate: string;
  endDate: string;
  signedDate?: string;
  autoRenew: boolean;
  renewalNoticeDays: number;
  paymentTerms: string;
  assignedTo: string;
  tags: string[];
  attachments: number;
  lastInvoiceDate?: string;
  nextInvoiceDate?: string;
  totalInvoiced: number;
  outstandingAmount: number;
  createdDate: string;
}
export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend (NestJS CrmContract) uses different field names than the page's
        // Contract model; map defensively and coerce numeric values.
        const raw = (await crmService.contracts.getAll()) as any[];
        const mapped: Contract[] = (raw || []).map((c) => ({
          id: String(c.id),
          contractNumber: c.contractNumber ?? '',
          title: c.title ?? '',
          customer: c.contactName ?? c.customerName ?? '',
          customerCompany: c.customerName ?? '',
          type: (c.type ?? 'custom') as Contract['type'],
          status: (c.status ?? 'draft') as Contract['status'],
          value: Number(c.contractValue ?? c.value ?? 0),
          recurringValue: c.recurringValue != null ? Number(c.recurringValue) : undefined,
          billingCycle: c.billingCycle ?? undefined,
          startDate: c.startDate ?? '',
          endDate: c.endDate ?? '',
          signedDate: c.signedDate ?? undefined,
          autoRenew: Boolean(c.autoRenew),
          renewalNoticeDays: Number(c.renewalNoticeDays ?? 0),
          paymentTerms: c.paymentTerms ?? '',
          assignedTo: c.ownerName ?? c.assignedTo ?? '',
          tags: Array.isArray(c.tags) ? c.tags : [],
          attachments: Array.isArray(c.attachments) ? c.attachments.length : Number(c.attachments ?? 0),
          lastInvoiceDate: c.lastInvoiceDate ?? undefined,
          nextInvoiceDate: c.nextInvoiceDate ?? c.renewalDate ?? undefined,
          totalInvoiced: Number(c.totalInvoiced ?? 0),
          outstandingAmount: Number(c.outstandingAmount ?? 0),
          createdDate: c.createdAt ?? c.createdDate ?? '',
        }));
        if (!cancelled) setContracts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load contracts');
          setContracts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'pending_renewal' | 'expired' | 'terminated' | 'suspended'>('all');
  const [filterType, setFilterType] = useState<'all' | 'service' | 'subscription' | 'license' | 'support' | 'maintenance' | 'custom'>('all');

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const matchesType = filterType === 'all' || contract.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    totalValue: contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0),
    recurringRevenue: contracts.filter(c => c.status === 'active' && c.recurringValue).reduce((sum, c) => sum + (c.recurringValue || 0), 0),
    pendingRenewal: contracts.filter(c => c.status === 'pending_renewal').length,
    outstanding: contracts.reduce((sum, c) => sum + c.outstandingAmount, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending_renewal': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-orange-100 text-orange-700';
      case 'terminated': return 'bg-red-100 text-red-700';
      case 'suspended': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-blue-100 text-blue-700';
      case 'subscription': return 'bg-purple-100 text-purple-700';
      case 'license': return 'bg-green-100 text-green-700';
      case 'support': return 'bg-orange-100 text-orange-700';
      case 'maintenance': return 'bg-teal-100 text-teal-700';
      case 'custom': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysUntilEnd = (endDate: string) => {
    return Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const isExpiringWithin90Days = (contract: Contract) => {
    const days = getDaysUntilEnd(contract.endDate);
    return days <= 90 && days >= 0 && contract.status === 'active';
  };

  const handleCreateContract = () => {
    router.push('/crm/contracts/create');
  };

  const handleViewContract = (contract: Contract) => {
    router.push(`/crm/contracts/view/${contract.id}`);
  };

  const handleEditContract = (contract: Contract) => {
    router.push(`/crm/contracts/edit/${contract.id}`);
  };

  const handleDownloadContract = (contract: Contract) => {
    // Silent download operation
    console.log(`Downloading contract ${contract.contractNumber}`);
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading contracts…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && contracts.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No contracts found.
        </div>
      )}
      <div className="mb-8">
        <div className="flex justify-end mb-3">
          <button
            onClick={handleCreateContract}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Contract
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <FileText className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalContracts}</div>
            <div className="text-blue-100 text-sm">Total Contracts</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.activeContracts}</div>
            <div className="text-green-100 text-sm">Active</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <DollarSign className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">${(stats.totalValue / 1000000).toFixed(1)}M</div>
            <div className="text-purple-100 text-sm">Total Value</div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white">
            <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">${(stats.recurringRevenue / 1000).toFixed(0)}K</div>
            <div className="text-teal-100 text-sm">MRR/ARR</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 text-white">
            <RefreshCw className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.pendingRenewal}</div>
            <div className="text-yellow-100 text-sm">Pending Renewal</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
            <AlertCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">${(stats.outstanding / 1000).toFixed(0)}K</div>
            <div className="text-red-100 text-sm">Outstanding</div>
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
                  placeholder="Search contracts..."
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
              <option value="active">Active</option>
              <option value="pending_renewal">Pending Renewal</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="service">Service</option>
              <option value="subscription">Subscription</option>
              <option value="license">License</option>
              <option value="support">Support</option>
              <option value="maintenance">Maintenance</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-2">
        {filteredContracts.map((contract) => {
          const expiringWithin90Days = isExpiringWithin90Days(contract);
          const daysUntilEnd = getDaysUntilEnd(contract.endDate);

          return (
            <div
              key={contract.id}
              className={`bg-white rounded-lg border p-3 hover:shadow-md transition-shadow ${
                expiringWithin90Days ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{contract.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                      {contract.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(contract.type)}`}>
                      {contract.type}
                    </span>
                    {contract.autoRenew && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        <RefreshCw className="w-3 h-3" />
                        Auto-Renew
                      </span>
                    )}
                    {expiringWithin90Days && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Expiring in {daysUntilEnd} days
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{contract.contractNumber}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {contract.customerCompany}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {contract.customer}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewContract(contract)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEditContract(contract)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDownloadContract(contract)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2 mb-2">
                {/* Contract Value */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-green-700 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-medium">Total Value</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    ${(contract.value / 1000).toFixed(0)}K
                  </div>
                  {contract.recurringValue && (
                    <div className="text-xs text-green-700 mt-1">
                      ${(contract.recurringValue / 1000).toFixed(1)}K {contract.billingCycle}
                    </div>
                  )}
                </div>

                {/* Contract Period */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-blue-700 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Period</span>
                  </div>
                  <div className="text-sm font-bold text-blue-900">
                    {new Date(contract.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-blue-700">
                    to {new Date(contract.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Invoiced */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-purple-700 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-medium">Invoiced</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    ${(contract.totalInvoiced / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-purple-700">
                    {((contract.totalInvoiced / contract.value) * 100).toFixed(0)}% of total
                  </div>
                </div>

                {/* Outstanding */}
                <div className={`bg-gradient-to-br rounded-lg p-3 ${
                  contract.outstandingAmount > 0
                    ? 'from-red-50 to-red-100'
                    : 'from-gray-50 to-gray-100'
                }`}>
                  <div className={`flex items-center gap-1 mb-1 ${
                    contract.outstandingAmount > 0 ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Outstanding</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    contract.outstandingAmount > 0 ? 'text-red-900' : 'text-gray-900'
                  }`}>
                    ${(contract.outstandingAmount / 1000).toFixed(1)}K
                  </div>
                  <div className={`text-xs ${
                    contract.outstandingAmount > 0 ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    {contract.outstandingAmount > 0 ? contract.paymentTerms : 'All paid'}
                  </div>
                </div>

                {/* Next Invoice */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-orange-700 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Next Invoice</span>
                  </div>
                  <div className="text-sm font-bold text-orange-900">
                    {contract.nextInvoiceDate
                      ? new Date(contract.nextInvoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'N/A'}
                  </div>
                  <div className="text-xs text-orange-700 capitalize">
                    {contract.billingCycle || 'One-time'}
                  </div>
                </div>

                {/* Assigned To */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-teal-700 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">Assigned To</span>
                  </div>
                  <div className="text-sm font-medium text-teal-900">{contract.assignedTo}</div>
                  <div className="text-xs text-teal-700">{contract.attachments} attachments</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-3 gap-2 mb-2 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Payment Terms</div>
                  <div className="text-sm font-medium text-gray-900">{contract.paymentTerms}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Renewal Notice</div>
                  <div className="text-sm font-medium text-gray-900">{contract.renewalNoticeDays} days</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Signed Date</div>
                  <div className="text-sm font-medium text-gray-900">
                    {contract.signedDate ? new Date(contract.signedDate).toLocaleDateString() : 'Not signed'}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {contract.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Timeline */}
              {contract.status === 'active' && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-600">Contract Progress</span>
                    <span className="font-medium text-gray-900">
                      {((new Date().getTime() - new Date(contract.startDate).getTime()) /
                        (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{
                        width: `${((new Date().getTime() - new Date(contract.startDate).getTime()) /
                                (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) * 100).toFixed(0)}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>{new Date(contract.startDate).toLocaleDateString()}</span>
                    <span>{daysUntilEnd > 0 ? `${daysUntilEnd} days remaining` : 'Expired'}</span>
                    <span>{new Date(contract.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Created: {new Date(contract.createdDate).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
