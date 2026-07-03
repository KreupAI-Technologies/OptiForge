'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, Edit, FileText, Phone, AlertTriangle, Clock, RefreshCw, DollarSign, TrendingUp, Users, Calendar, Shield, Bell, Download, Filter, MoreVertical, Wrench, MapPin, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { ServiceContractService } from '@/services/service-contract.service';

interface ExpiringServiceContract {
  id: string;
  contractNumber: string;
  contractType: 'AMC' | 'CMC' | 'Pay Per Visit' | 'Parts & Labor' | 'Extended Warranty';
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  duration: number;
  pricingTier: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  contractValue: number;
  responseTimeSLA: number;
  resolutionTimeSLA: number;
  renewalCount: number;
  totalBilled: number;
  totalPaid: number;
  outstandingAmount: number;
  equipmentCount: number;
  accountManager: string;
  billingFrequency: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  autoRenewal: boolean;
  healthScore: number;
  serviceVisits: number;
  lastServiceDate: string;
  customerSatisfaction: number;
  technicianAssigned: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  utilizationRate: number;
  complianceScore: number;
  remainingDays: number;
  renewalStatus: 'not_initiated' | 'discussion' | 'proposal_sent' | 'negotiation' | 'agreement' | 'renewal_confirmed';
  renewalProbability: number;
  renewalValueProposed: number;
  lastContactDate: string;
  nextFollowUpDate: string;
  renewalNotes: string;
  competitorThreat: 'none' | 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export default function ExpiringServiceContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ExpiringServiceContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns the ServiceContract DTO. This page shows contracts
        // expiring within 90 days. Renewal-CRM fields are not provided by the
        // API and are defaulted; remainingDays is derived from endDate.
        const raw = (await ServiceContractService.getAllServiceContracts()) as any[];
        const mapped: ExpiringServiceContract[] = (raw ?? [])
          .map((c) => {
            const endDate = c.endDate ?? '';
            const remainingDays = endDate
              ? Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : 0;
            return {
              id: String(c.id ?? ''),
              contractNumber: c.contractNumber ?? '',
              contractType: c.contractType ?? 'AMC',
              customerId: c.customerId ?? '',
              customerName: c.customerName ?? '',
              startDate: c.startDate ?? '',
              endDate,
              duration: Number(c.duration ?? 0),
              pricingTier: c.pricingTier ?? 'Basic',
              contractValue: Number(c.contractValue ?? 0),
              responseTimeSLA: Number(c.responseTimeSLA ?? 0),
              resolutionTimeSLA: Number(c.resolutionTimeSLA ?? 0),
              renewalCount: Number(c.renewalCount ?? 0),
              totalBilled: Number(c.totalBilled ?? 0),
              totalPaid: Number(c.totalPaid ?? 0),
              outstandingAmount: Number(c.outstandingAmount ?? 0),
              equipmentCount: Number(c.equipmentCount ?? 0),
              accountManager: c.accountManager ?? '',
              billingFrequency: c.billingFrequency ?? 'monthly',
              autoRenewal: Boolean(c.autoRenewal ?? false),
              healthScore: Number(c.healthScore ?? 0),
              serviceVisits: Number(c.serviceVisits ?? 0),
              lastServiceDate: c.lastServiceDate ?? '',
              customerSatisfaction: Number(c.customerSatisfaction ?? 0),
              technicianAssigned: c.technicianAssigned ?? '',
              location: c.location ?? '',
              priority: c.priority ?? 'medium',
              utilizationRate: Number(c.utilizationRate ?? 0),
              complianceScore: Number(c.complianceScore ?? 0),
              remainingDays,
              // Renewal-CRM fields not provided by the contracts API.
              renewalStatus: c.renewalStatus ?? 'not_initiated',
              renewalProbability: Number(c.renewalProbability ?? 0),
              renewalValueProposed: Number(c.renewalValueProposed ?? 0),
              lastContactDate: c.lastContactDate ?? '',
              nextFollowUpDate: c.nextFollowUpDate ?? '',
              renewalNotes: c.renewalNotes ?? '',
              competitorThreat: c.competitorThreat ?? 'none',
              riskLevel: c.riskLevel ?? 'low',
            };
          })
          // Expiring soon: not yet expired but within 90 days.
          .filter((c) => c.remainingDays >= 0 && c.remainingDays <= 90);
        if (!cancelled) setContracts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load expiring contracts');
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
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('remainingDays');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ExpiringServiceContract | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  // Filter and search contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch =
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.accountManager.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || contract.contractType === selectedType;
    const matchesRisk = selectedRisk === 'all' || contract.riskLevel === selectedRisk;
    const matchesStatus = selectedStatus === 'all' || contract.renewalStatus === selectedStatus;

    return matchesSearch && matchesType && matchesRisk && matchesStatus;
  });

  // Sort contracts
  const sortedContracts = [...filteredContracts].sort((a, b) => {
    let aValue: any = a[sortBy as keyof ExpiringServiceContract];
    let bValue: any = b[sortBy as keyof ExpiringServiceContract];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'AMC': return 'bg-blue-100 text-blue-800';
      case 'CMC': return 'bg-green-100 text-green-800';
      case 'Pay Per Visit': return 'bg-yellow-100 text-yellow-800';
      case 'Parts & Labor': return 'bg-purple-100 text-purple-800';
      case 'Extended Warranty': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRenewalStatusColor = (status: string) => {
    switch (status) {
      case 'not_initiated': return 'bg-gray-100 text-gray-800';
      case 'discussion': return 'bg-blue-100 text-blue-800';
      case 'proposal_sent': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-yellow-100 text-yellow-800';
      case 'agreement': return 'bg-green-100 text-green-800';
      case 'renewal_confirmed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpiryUrgencyColor = (days: number) => {
    if (days <= 7) return 'text-red-600 font-bold';
    if (days <= 30) return 'text-orange-600 font-semibold';
    if (days <= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    if (probability >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleRenewalAction = (contract: ExpiringServiceContract) => {
    setSelectedContract(contract);
    setShowRenewalModal(true);
  };

  const calculateStats = () => {
    const criticalExpiry = contracts.filter(c => c.remainingDays <= 30).length;
    const totalValue = contracts.reduce((sum, contract) => sum + contract.contractValue, 0);
    const totalRenewalValue = contracts.reduce((sum, contract) => sum + contract.renewalValueProposed, 0);
    const avgProbability = contracts.length
      ? contracts.reduce((sum, contract) => sum + contract.renewalProbability, 0) / contracts.length
      : 0;
    const highRiskContracts = contracts.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length;
    const confirmedRenewals = contracts.filter(c => c.renewalStatus === 'renewal_confirmed' || c.renewalStatus === 'agreement').length;

    return {
      criticalExpiry,
      totalValue,
      totalRenewalValue,
      avgProbability,
      highRiskContracts,
      confirmedRenewals
    };
  };

  const stats = calculateStats();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-3 space-y-3">
      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading expiring contracts…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && contracts.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No expiring contracts found.
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expiring Service Contracts</h1>
          <p className="text-gray-600">Monitor and manage contract renewals</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => router.push('/after-sales-service/service-contracts/renewals')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <RefreshCw className="w-4 h-4" />
            Renewal Center
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalExpiry}</p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Renewal Value</p>
              <p className="text-2xl font-bold text-green-600">₹{(stats.totalRenewalValue / 100000).toFixed(1)}L</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Probability</p>
              <p className={`text-2xl font-bold ${getProbabilityColor(stats.avgProbability)}`}>
                {stats.avgProbability.toFixed(0)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{stats.highRiskContracts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmedRenewals}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="remainingDays">Sort by Expiry</option>
            <option value="renewalProbability">Sort by Probability</option>
            <option value="contractValue">Sort by Value</option>
            <option value="riskLevel">Sort by Risk</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-3 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Contract Types</option>
              <option value="AMC">AMC</option>
              <option value="CMC">CMC</option>
              <option value="Pay Per Visit">Pay Per Visit</option>
              <option value="Parts & Labor">Parts & Labor</option>
              <option value="Extended Warranty">Extended Warranty</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Renewal Status</option>
              <option value="not_initiated">Not Initiated</option>
              <option value="discussion">Discussion</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="agreement">Agreement</option>
              <option value="renewal_confirmed">Confirmed</option>
            </select>
          </div>
        )}
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Manager
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry & Risk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Renewal Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial Impact
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{contract.contractNumber}</div>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getContractTypeColor(contract.contractType)}`}>
                        {contract.contractType}
                      </div>
                      <div className="text-xs text-gray-500">{contract.pricingTier} Tier</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{contract.customerName}</div>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {contract.location}
                      </div>
                      <div className="text-xs text-gray-500">AM: {contract.accountManager}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className={`text-sm font-medium ${getExpiryUrgencyColor(contract.remainingDays)}`}>
                        {contract.remainingDays} days left
                      </div>
                      <div className="text-xs text-gray-500">
                        Expires: {new Date(contract.endDate).toLocaleDateString()}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(contract.riskLevel)}`}>
                        {contract.riskLevel.toUpperCase()} RISK
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRenewalStatusColor(contract.renewalStatus)}`}>
                        {contract.renewalStatus.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className={`text-sm font-medium ${getProbabilityColor(contract.renewalProbability)}`}>
                        {contract.renewalProbability}% probability
                      </div>
                      <div className="text-xs text-gray-500">
                        Next: {new Date(contract.nextFollowUpDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        Current: ₹{(contract.contractValue / 100000).toFixed(1)}L
                      </div>
                      {contract.renewalValueProposed > 0 && (
                        <div className="text-sm font-medium text-green-600">
                          Proposed: ₹{(contract.renewalValueProposed / 100000).toFixed(1)}L
                        </div>
                      )}
                      {contract.outstandingAmount > 0 && (
                        <div className="text-xs text-red-600">
                          Outstanding: ₹{(contract.outstandingAmount / 1000).toFixed(0)}K
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        Health: {contract.healthScore}%
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="w-3 h-3 mr-1 text-yellow-400" />
                        {contract.customerSatisfaction.toFixed(1)} Rating
                      </div>
                      <div className="text-xs text-gray-500">
                        Visits: {contract.serviceVisits}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRenewalAction(contract)}
                        className="text-green-600 hover:text-green-900"

                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/after-sales-service/service-contracts/view/${contract.id}`)}
                        className="text-blue-600 hover:text-blue-900"

                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Handle contact action
                        }}
                        className="text-purple-600 hover:text-purple-900"

                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal Action Modal */}
      {showRenewalModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg p-3 w-full  max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">Renewal Management</h2>
              <button
                onClick={() => setShowRenewalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Contract Summary */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Contract Summary</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contract:</span>
                    <span className="font-medium">{selectedContract.contractNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedContract.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Value:</span>
                    <span className="font-medium">₹{(selectedContract.contractValue / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires In:</span>
                    <span className={`font-medium ${getExpiryUrgencyColor(selectedContract.remainingDays)}`}>
                      {selectedContract.remainingDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health Score:</span>
                    <span className="font-medium">{selectedContract.healthScore}%</span>
                  </div>
                </div>
              </div>

              {/* Renewal Details */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Renewal Details</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRenewalStatusColor(selectedContract.renewalStatus)}`}>
                      {selectedContract.renewalStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Probability:</span>
                    <span className={`font-medium ${getProbabilityColor(selectedContract.renewalProbability)}`}>
                      {selectedContract.renewalProbability}%
                    </span>
                  </div>
                  {selectedContract.renewalValueProposed > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Proposed Value:</span>
                      <span className="font-medium text-green-600">
                        ₹{(selectedContract.renewalValueProposed / 100000).toFixed(1)}L
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(selectedContract.riskLevel)}`}>
                      {selectedContract.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Follow-up:</span>
                    <span className="font-medium">{new Date(selectedContract.nextFollowUpDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Renewal Notes */}
              <div className="lg:col-span-2 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Renewal Notes</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{selectedContract.renewalNotes}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRenewalModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => router.push(`/after-sales-service/service-contracts/renewals?contract=${selectedContract.id}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Manage Renewal
              </button>
              <button
                onClick={() => router.push(`/after-sales-service/service-contracts/view/${selectedContract.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}