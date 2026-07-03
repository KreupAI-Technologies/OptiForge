'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, RefreshCw, TrendingUp, User, Building2, Send, Phone, Mail, FileText } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface ContractRenewal {
  id: string;
  contractNumber: string;
  contractTitle: string;
  customer: string;
  customerCompany: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  currentValue: number;
  proposedValue: number;
  valueChange: number;
  changePercent: number;
  currentEndDate: string;
  proposedStartDate: string;
  proposedDuration: number; // months
  daysUntilExpiry: number;
  renewalProbability: number;
  status: 'upcoming' | 'in_progress' | 'negotiation' | 'committed' | 'at_risk' | 'lost' | 'renewed';
  lastContactDate: string;
  nextFollowUpDate: string;
  assignedTo: string;
  tags: string[];
  notes: string;
  autoRenew: boolean;
  renewalNoticeSent: boolean;
  customerResponse?: string;
}

const mockRenewals: ContractRenewal[] = [
  {
    id: '1',
    contractNumber: 'CNT-2024-003',
    contractTitle: 'Premium Support Package',
    customer: 'Robert Johnson',
    customerCompany: 'Global Industries Ltd',
    contactPerson: 'Robert Johnson - CTO',
    contactEmail: 'rjohnson@globalind.com',
    contactPhone: '+1 555-0123',
    currentValue: 85000,
    proposedValue: 95000,
    valueChange: 10000,
    changePercent: 11.76,
    currentEndDate: '2024-10-31',
    proposedStartDate: '2024-11-01',
    proposedDuration: 12,
    daysUntilExpiry: 11,
    renewalProbability: 85,
    status: 'in_progress',
    lastContactDate: '2024-10-15',
    nextFollowUpDate: '2024-10-22',
    assignedTo: 'Sarah Johnson',
    tags: ['Support', 'Premium', 'High Priority'],
    notes: 'Customer very satisfied with current service. Discussed upgraded tier with additional features.',
    autoRenew: false,
    renewalNoticeSent: true,
    customerResponse: 'Positive - reviewing proposal',
  },
  {
    id: '2',
    contractNumber: 'CNT-2024-012',
    contractTitle: 'Enterprise Software License',
    customer: 'Lisa Chen',
    customerCompany: 'TechVision Corp',
    contactPerson: 'Lisa Chen - VP Operations',
    contactEmail: 'lchen@techvision.com',
    contactPhone: '+1 555-0145',
    currentValue: 250000,
    proposedValue: 280000,
    valueChange: 30000,
    changePercent: 12,
    currentEndDate: '2024-11-15',
    proposedStartDate: '2024-11-16',
    proposedDuration: 24,
    daysUntilExpiry: 26,
    renewalProbability: 90,
    status: 'negotiation',
    lastContactDate: '2024-10-18',
    nextFollowUpDate: '2024-10-25',
    assignedTo: 'Michael Chen',
    tags: ['Enterprise', 'Software', 'Multi-Year'],
    notes: 'Negotiating multi-year discount. Customer interested in adding 50 more licenses.',
    autoRenew: false,
    renewalNoticeSent: true,
    customerResponse: 'Negotiating terms',
  },
  {
    id: '3',
    contractNumber: 'CNT-2024-008',
    contractTitle: 'Cloud Infrastructure Services',
    customer: 'David Martinez',
    customerCompany: 'StartupHub Inc',
    contactPerson: 'David Martinez - CTO',
    contactEmail: 'dmartinez@startuphub.com',
    contactPhone: '+1 555-0167',
    currentValue: 48000,
    proposedValue: 48000,
    valueChange: 0,
    changePercent: 0,
    currentEndDate: '2024-11-30',
    proposedStartDate: '2024-12-01',
    proposedDuration: 12,
    daysUntilExpiry: 41,
    renewalProbability: 95,
    status: 'committed',
    lastContactDate: '2024-10-10',
    nextFollowUpDate: '2024-11-05',
    assignedTo: 'Sarah Johnson',
    tags: ['Cloud', 'Infrastructure', 'Committed'],
    notes: 'Verbal commitment received. Preparing renewal paperwork.',
    autoRenew: true,
    renewalNoticeSent: true,
    customerResponse: 'Committed to renew',
  },
  {
    id: '4',
    contractNumber: 'CNT-2024-015',
    contractTitle: 'Managed Services Agreement',
    customer: 'Patricia Wilson',
    customerCompany: 'Financial Services Group',
    contactPerson: 'Patricia Wilson - IT Director',
    contactEmail: 'pwilson@finservices.com',
    contactPhone: '+1 555-0189',
    currentValue: 120000,
    proposedValue: 110000,
    valueChange: -10000,
    changePercent: -8.33,
    currentEndDate: '2024-12-15',
    proposedStartDate: '2024-12-16',
    proposedDuration: 12,
    daysUntilExpiry: 56,
    renewalProbability: 45,
    status: 'at_risk',
    lastContactDate: '2024-10-12',
    nextFollowUpDate: '2024-10-21',
    assignedTo: 'David Park',
    tags: ['Managed Services', 'At Risk', 'Price Sensitive'],
    notes: 'Customer concerned about pricing. Competitor offering lower rate. Proposed discount to retain.',
    autoRenew: false,
    renewalNoticeSent: true,
    customerResponse: 'Evaluating competitors',
  },
  {
    id: '5',
    contractNumber: 'CNT-2025-002',
    contractTitle: 'SaaS Subscription - Business Plan',
    customer: 'James Anderson',
    customerCompany: 'Retail Innovations',
    contactPerson: 'James Anderson - CEO',
    contactEmail: 'janderson@retailinno.com',
    contactPhone: '+1 555-0201',
    currentValue: 36000,
    proposedValue: 42000,
    valueChange: 6000,
    changePercent: 16.67,
    currentEndDate: '2025-01-10',
    proposedStartDate: '2025-01-11',
    proposedDuration: 12,
    daysUntilExpiry: 82,
    renewalProbability: 70,
    status: 'upcoming',
    lastContactDate: '2024-10-05',
    nextFollowUpDate: '2024-10-28',
    assignedTo: 'Sarah Johnson',
    tags: ['SaaS', 'Subscription', 'Upgrade'],
    notes: 'Planning to propose upgrade to Enterprise tier. Customer growth aligns with higher tier.',
    autoRenew: true,
    renewalNoticeSent: false,
  },
  {
    id: '6',
    contractNumber: 'CNT-2023-045',
    contractTitle: 'Professional Services Retainer',
    customer: 'Maria Garcia',
    customerCompany: 'Healthcare Systems Inc',
    contactPerson: 'Maria Garcia - VP Technology',
    contactEmail: 'mgarcia@healthsys.com',
    contactPhone: '+1 555-0223',
    currentValue: 96000,
    proposedValue: 0,
    valueChange: -96000,
    changePercent: -100,
    currentEndDate: '2024-09-30',
    proposedStartDate: '2024-10-01',
    proposedDuration: 12,
    daysUntilExpiry: -20,
    renewalProbability: 0,
    status: 'lost',
    lastContactDate: '2024-09-15',
    nextFollowUpDate: '2025-04-01',
    assignedTo: 'Michael Chen',
    tags: ['Services', 'Lost', 'Budget Cuts'],
    notes: 'Customer decided not to renew due to budget constraints. Follow up in 6 months for potential re-engagement.',
    autoRenew: false,
    renewalNoticeSent: true,
    customerResponse: 'Not renewing',
  },
  {
    id: '7',
    contractNumber: 'CNT-2024-021',
    contractTitle: 'Annual Maintenance Contract',
    customer: 'Thomas Brown',
    customerCompany: 'Manufacturing Solutions Co',
    contactPerson: 'Thomas Brown - Operations Manager',
    contactEmail: 'tbrown@mfgsolutions.com',
    contactPhone: '+1 555-0245',
    currentValue: 65000,
    proposedValue: 72000,
    valueChange: 7000,
    changePercent: 10.77,
    currentEndDate: '2025-02-28',
    proposedStartDate: '2025-03-01',
    proposedDuration: 12,
    daysUntilExpiry: 131,
    renewalProbability: 75,
    status: 'upcoming',
    lastContactDate: '2024-09-30',
    nextFollowUpDate: '2024-11-15',
    assignedTo: 'David Park',
    tags: ['Maintenance', 'Manufacturing', 'Standard'],
    notes: 'Early renewal opportunity. Customer expanding operations and may need additional coverage.',
    autoRenew: true,
    renewalNoticeSent: false,
  },
  {
    id: '8',
    contractNumber: 'CNT-2023-052',
    contractTitle: 'Software License & Support',
    customer: 'Emily White',
    customerCompany: 'E-Commerce Ventures',
    contactPerson: 'Emily White - Product Director',
    contactEmail: 'ewhite@ecomventures.com',
    contactPhone: '+1 555-0267',
    currentValue: 150000,
    proposedValue: 150000,
    valueChange: 0,
    changePercent: 0,
    currentEndDate: '2024-10-15',
    proposedStartDate: '2024-10-16',
    proposedDuration: 12,
    daysUntilExpiry: -5,
    renewalProbability: 100,
    status: 'renewed',
    lastContactDate: '2024-10-08',
    nextFollowUpDate: '2025-07-15',
    assignedTo: 'Sarah Johnson',
    tags: ['License', 'Support', 'Renewed'],
    notes: 'Successfully renewed! Contract executed on time. Customer very satisfied.',
    autoRenew: false,
    renewalNoticeSent: true,
    customerResponse: 'Renewed',
  },
];

export default function ContractRenewalsPage() {
  const [renewals, setRenewals] = useState<ContractRenewal[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await crmService.contractRenewals.getAll();
        if (!active) return;
        const rows = Array.isArray(data) ? data : [];
        setRenewals(
          rows.map((r: any) => ({
            id: String(r?.id ?? ''),
            contractNumber: r?.contractNumber ?? '',
            contractTitle: r?.contractTitle ?? '',
            customer: r?.customer ?? '',
            customerCompany: r?.customerCompany ?? '',
            contactPerson: r?.contactPerson ?? '',
            contactEmail: r?.contactEmail ?? '',
            contactPhone: r?.contactPhone ?? '',
            currentValue: Number(r?.currentValue ?? 0),
            proposedValue: Number(r?.proposedValue ?? 0),
            valueChange: Number(r?.valueChange ?? 0),
            changePercent: Number(r?.changePercent ?? 0),
            currentEndDate: r?.currentEndDate ?? '',
            proposedStartDate: r?.proposedStartDate ?? '',
            proposedDuration: Number(r?.proposedDuration ?? 0),
            daysUntilExpiry: Number(r?.daysUntilExpiry ?? 0),
            renewalProbability: Number(r?.renewalProbability ?? 0),
            status: (r?.status ?? 'upcoming') as ContractRenewal['status'],
            lastContactDate: r?.lastContactDate ?? '',
            nextFollowUpDate: r?.nextFollowUpDate ?? '',
            assignedTo: r?.assignedTo ?? '',
            tags: Array.isArray(r?.tags) ? r.tags : [],
            notes: r?.notes ?? '',
            autoRenew: Boolean(r?.autoRenew),
            renewalNoticeSent: Boolean(r?.renewalNoticeSent),
            customerResponse: r?.customerResponse ?? undefined,
          })),
        );
      } catch {
        if (active) setRenewals(mockRenewals);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'in_progress' | 'negotiation' | 'committed' | 'at_risk' | 'lost' | 'renewed'>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | '30_days' | '60_days' | '90_days'>('all');

  const filteredRenewals = renewals
    .filter(renewal => {
      const matchesSearch = renewal.contractTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           renewal.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           renewal.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           renewal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || renewal.status === filterStatus;

      let matchesTimeframe = true;
      if (timeframeFilter === '30_days') matchesTimeframe = renewal.daysUntilExpiry <= 30 && renewal.daysUntilExpiry >= 0;
      if (timeframeFilter === '60_days') matchesTimeframe = renewal.daysUntilExpiry <= 60 && renewal.daysUntilExpiry >= 0;
      if (timeframeFilter === '90_days') matchesTimeframe = renewal.daysUntilExpiry <= 90 && renewal.daysUntilExpiry >= 0;

      return matchesSearch && matchesStatus && matchesTimeframe;
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  const stats = {
    totalRenewals: renewals.filter(r => r.daysUntilExpiry >= 0 && r.status !== 'renewed' && r.status !== 'lost').length,
    atRisk: renewals.filter(r => r.status === 'at_risk').length,
    committed: renewals.filter(r => r.status === 'committed').length,
    totalValue: renewals.filter(r => r.daysUntilExpiry >= 0 && r.status !== 'lost').reduce((sum, r) => sum + r.proposedValue, 0),
    avgProbability: Math.round(
      renewals.filter(r => r.daysUntilExpiry >= 0 && r.status !== 'renewed' && r.status !== 'lost')
        .reduce((sum, r) => sum + r.renewalProbability, 0) /
      renewals.filter(r => r.daysUntilExpiry >= 0 && r.status !== 'renewed' && r.status !== 'lost').length
    ),
    expiring30Days: renewals.filter(r => r.daysUntilExpiry <= 30 && r.daysUntilExpiry >= 0 && r.status !== 'renewed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'negotiation': return 'bg-yellow-100 text-yellow-700';
      case 'committed': return 'bg-green-100 text-green-700';
      case 'at_risk': return 'bg-red-100 text-red-700';
      case 'lost': return 'bg-gray-100 text-gray-700';
      case 'renewed': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4" />;
      case 'negotiation': return <AlertCircle className="w-4 h-4" />;
      case 'committed': return <CheckCircle className="w-4 h-4" />;
      case 'at_risk': return <AlertCircle className="w-4 h-4" />;
      case 'lost': return <AlertCircle className="w-4 h-4" />;
      case 'renewed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-700 bg-green-100';
    if (probability >= 60) return 'text-blue-700 bg-blue-100';
    if (probability >= 40) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="mb-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <RefreshCw className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalRenewals}</div>
            <div className="text-blue-100 text-sm">Total Renewals</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
            <AlertCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.atRisk}</div>
            <div className="text-red-100 text-sm">At Risk</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.committed}</div>
            <div className="text-green-100 text-sm">Committed</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <DollarSign className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">${(stats.totalValue / 1000000).toFixed(1)}M</div>
            <div className="text-purple-100 text-sm">Renewal Value</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.avgProbability}%</div>
            <div className="text-orange-100 text-sm">Avg Probability</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 text-white">
            <Calendar className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.expiring30Days}</div>
            <div className="text-yellow-100 text-sm">Expiring (30d)</div>
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
                  placeholder="Search renewals..."
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
              <option value="upcoming">Upcoming</option>
              <option value="in_progress">In Progress</option>
              <option value="negotiation">Negotiation</option>
              <option value="committed">Committed</option>
              <option value="at_risk">At Risk</option>
              <option value="lost">Lost</option>
              <option value="renewed">Renewed</option>
            </select>

            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Timeframes</option>
              <option value="30_days">Next 30 Days</option>
              <option value="60_days">Next 60 Days</option>
              <option value="90_days">Next 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Renewals List */}
      <div className="space-y-2">
        {filteredRenewals.map((renewal) => {
          const isUrgent = renewal.daysUntilExpiry <= 30 && renewal.daysUntilExpiry >= 0;

          return (
            <div
              key={renewal.id}
              className={`bg-white rounded-lg border p-3 hover:shadow-md transition-shadow ${
                isUrgent && renewal.status !== 'renewed' && renewal.status !== 'lost'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{renewal.contractTitle}</h3>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(renewal.status)}`}>
                      {getStatusIcon(renewal.status)}
                      {renewal.status.replace('_', ' ')}
                    </span>
                    {renewal.autoRenew && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        <RefreshCw className="w-3 h-3" />
                        Auto-Renew
                      </span>
                    )}
                    {isUrgent && renewal.status !== 'renewed' && renewal.status !== 'lost' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{renewal.contractNumber}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {renewal.customerCompany}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {renewal.customer}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1">
                    <Send className="w-4 h-4" />
                    Contact
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2 mb-2">
                {/* Days Until Expiry */}
                <div className={`bg-gradient-to-br rounded-lg p-3 ${
                  renewal.daysUntilExpiry < 0
                    ? 'from-gray-50 to-gray-100'
                    : renewal.daysUntilExpiry <= 30
                    ? 'from-red-50 to-red-100'
                    : 'from-orange-50 to-orange-100'
                }`}>
                  <div className={`flex items-center gap-1 mb-1 ${
                    renewal.daysUntilExpiry < 0 ? 'text-gray-700' : renewal.daysUntilExpiry <= 30 ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Expiry</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    renewal.daysUntilExpiry < 0 ? 'text-gray-900' : renewal.daysUntilExpiry <= 30 ? 'text-red-900' : 'text-orange-900'
                  }`}>
                    {renewal.daysUntilExpiry < 0 ? 'Expired' : `${renewal.daysUntilExpiry}d`}
                  </div>
                  <div className={`text-xs ${
                    renewal.daysUntilExpiry < 0 ? 'text-gray-600' : renewal.daysUntilExpiry <= 30 ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    {new Date(renewal.currentEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Current Value */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-blue-700 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-medium">Current</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${(renewal.currentValue / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-blue-700">Annual Value</div>
                </div>

                {/* Proposed Value */}
                <div className={`bg-gradient-to-br rounded-lg p-3 ${
                  renewal.valueChange > 0
                    ? 'from-green-50 to-green-100'
                    : renewal.valueChange < 0
                    ? 'from-red-50 to-red-100'
                    : 'from-gray-50 to-gray-100'
                }`}>
                  <div className={`flex items-center gap-1 mb-1 ${
                    renewal.valueChange > 0 ? 'text-green-700' : renewal.valueChange < 0 ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-medium">Proposed</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    renewal.valueChange > 0 ? 'text-green-900' : renewal.valueChange < 0 ? 'text-red-900' : 'text-gray-900'
                  }`}>
                    ${(renewal.proposedValue / 1000).toFixed(0)}K
                  </div>
                  <div className={`text-xs ${
                    renewal.valueChange > 0 ? 'text-green-700' : renewal.valueChange < 0 ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    {renewal.changePercent > 0 && '+'}
                    {renewal.changePercent.toFixed(1)}%
                  </div>
                </div>

                {/* Renewal Probability */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-purple-700 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Probability</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{renewal.renewalProbability}%</div>
                  <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${renewal.renewalProbability}%` }}></div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-teal-700 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">Contact</span>
                  </div>
                  <div className="text-sm font-medium text-teal-900 truncate">{renewal.contactPerson.split(' - ')[0]}</div>
                  <div className="flex gap-2 mt-2">
                    <a href={`mailto:${renewal.contactEmail}`} className="inline-flex items-center gap-1.5 px-2 py-1 text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded text-xs">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </a>
                    <a href={`tel:${renewal.contactPhone}`} className="inline-flex items-center gap-1.5 px-2 py-1 text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded text-xs">
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>

                {/* Assigned To */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-gray-700 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">Assigned</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{renewal.assignedTo}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {renewal.renewalNoticeSent ? '✓ Notice sent' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="grid grid-cols-2 gap-2 mb-2 pb-4 border-b border-gray-100">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Last Contact</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(renewal.lastContactDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Next Follow-up</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(renewal.nextFollowUpDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Customer Response */}
              {renewal.customerResponse && (
                <div className="mb-2">
                  <div className="text-xs text-gray-600 mb-1">Customer Response:</div>
                  <div className={`text-sm px-3 py-2 rounded-lg ${
                    renewal.customerResponse.includes('Committed') || renewal.customerResponse.includes('Positive')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : renewal.customerResponse.includes('Negotiating')
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : renewal.customerResponse.includes('Not renewing') || renewal.customerResponse.includes('Evaluating')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    {renewal.customerResponse}
                  </div>
                </div>
              )}

              {/* Notes */}
              {renewal.notes && (
                <div className="mb-2">
                  <div className="text-xs text-gray-600 mb-1">Notes:</div>
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 border border-gray-200">
                    {renewal.notes}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {renewal.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRenewals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No renewals found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
