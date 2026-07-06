'use client';

import React, { useState, useEffect } from 'react';
import { User, Building2, DollarSign, TrendingUp, Activity, Award, AlertCircle, Calendar, Phone, Mail, MapPin, CreditCard, ShoppingCart, FileText, MessageSquare, Star } from 'lucide-react';
import { crmService, asArray } from '@/services/crm.service';

export interface Customer360Data {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  customerSince: string;
  lifetimeValue: number;
  currentMRR: number;
  healthScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  segment: 'enterprise' | 'mid-market' | 'smb';
  interactionHistory: Array<{
    id: string;
    type: 'call' | 'email' | 'meeting' | 'support' | 'purchase';
    subject: string;
    date: string;
    outcome?: string;
  }>;
  linkedTickets: Array<{
    id: string;
    subject: string;
    status: 'open' | 'in-progress' | 'resolved';
    priority: 'high' | 'medium' | 'low';
    createdAt: string;
  }>;
  purchaseHistory: Array<{
    id: string;
    product: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending';
  }>;
  contractDetails: {
    type: 'subscription' | 'one-time';
    startDate: string;
    endDate: string;
    value: number;
    renewalStatus: 'auto-renew' | 'manual-renew' | 'at-risk';
  };
  csatScores: Array<{
    score: number;
    date: string;
    feedback: string;
  }>;
}

const emptyCustomer: Customer360Data = {
  id: '',
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  customerSince: '',
  lifetimeValue: 0,
  currentMRR: 0,
  healthScore: 0,
  sentiment: 'neutral',
  segment: 'enterprise',
  interactionHistory: [],
  linkedTickets: [],
  purchaseHistory: [],
  contractDetails: {
    type: 'subscription',
    startDate: '',
    endDate: '',
    value: 0,
    renewalStatus: 'manual-renew'
  },
  csatScores: []
};

const sentimentColors = {
  positive: 'bg-green-100 text-green-700 border-green-300',
  neutral: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  negative: 'bg-red-100 text-red-700 border-red-300'
};

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700'
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-700'
};

export default function Customer360View() {
  const [customer, setCustomer] = useState<Customer360Data>(emptyCustomer);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'tickets' | 'purchases' | 'csat'>('overview');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const listRes = await crmService.customers.getAll();
        const list = asArray<any>(listRes);
        if (!list.length) { if (mounted) setLoading(false); return; }
        const first = list[0];
        const cid = String(first.id ?? '');
        const [detail, opps, contacts, activities] = await Promise.all([
          crmService.customers.getById(cid).catch(() => first),
          crmService.customers.getOpportunities(cid).catch(() => []),
          crmService.customers.getContacts(cid).catch(() => []),
          crmService.customers.getActivities(cid).catch(() => []),
        ]);
        const c: any = detail ?? first;
        const primaryContact: any = asArray<any>(contacts)[0] ?? {};
        const mapped: Customer360Data = {
          id: cid,
          name: c.name ?? c.customerName ?? `${primaryContact.firstName ?? ''} ${primaryContact.lastName ?? ''}`.trim(),
          company: c.name ?? c.customerName ?? c.companyName ?? '',
          email: c.email ?? primaryContact.email ?? '',
          phone: c.phone ?? primaryContact.phone ?? '',
          address: c.address ?? c.billingAddress ?? '',
          customerSince: c.customerSince ?? c.createdAt ?? '',
          lifetimeValue: Number(c.lifetimeValue ?? 0),
          currentMRR: Number(c.currentMRR ?? c.mrr ?? 0),
          healthScore: Number(c.healthScore ?? 0),
          sentiment: (c.sentiment ?? 'neutral') as Customer360Data['sentiment'],
          segment: (c.segment ?? 'enterprise') as Customer360Data['segment'],
          interactionHistory: asArray<any>(activities).map((a: any) => ({
            id: String(a.id ?? ''),
            type: (a.type ?? 'call') as any,
            subject: a.subject ?? '',
            date: a.startDate ?? a.dueDate ?? a.createdAt ?? '',
            outcome: a.outcome ?? undefined,
          })),
          linkedTickets: [],
          purchaseHistory: asArray<any>(opps).map((o: any) => ({
            id: String(o.opportunityNumber ?? o.id ?? ''),
            product: o.name ?? '',
            amount: Number(o.amount ?? 0),
            date: o.actualCloseDate ?? o.expectedCloseDate ?? o.createdAt ?? '',
            status: (o.stage === 'closed_won' || o.actualCloseDate ? 'completed' : 'pending') as any,
          })),
          contractDetails: {
            type: (c.contractType ?? 'subscription') as any,
            startDate: c.contractStartDate ?? '',
            endDate: c.contractEndDate ?? '',
            value: Number(c.contractValue ?? 0),
            renewalStatus: (c.renewalStatus ?? 'manual-renew') as any,
          },
          csatScores: [],
        };
        if (mounted) setCustomer(mapped);
      } catch (e) {
        if (mounted) setCustomer(emptyCustomer);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const avgCSAT = customer.csatScores.length
    ? customer.csatScores.reduce((sum, s) => sum + s.score, 0) / customer.csatScores.length
    : 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <User className="h-8 w-8 text-indigo-600 mr-3" />
          Customer 360° View
        </h2>
        <p className="text-gray-600 mt-1">Complete customer interaction history, purchase journey, warranty status, and CSAT feedback</p>
      </div>

      {/* Customer Header Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg border-2 border-indigo-200 p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{customer.name}</h3>
              <div className="flex items-center space-x-3 mt-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">{customer.company}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${sentimentColors[customer.sentiment]}`}>
                  {customer.sentiment} sentiment
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-300 capitalize">
                  {customer.segment}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${customer.email}`} className="text-indigo-600 hover:underline">{customer.email}</a>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${customer.phone}`} className="text-indigo-600 hover:underline">{customer.phone}</a>
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{customer.address}</span>
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Customer Health Score</p>
            <div className="relative inline-flex">
              <svg className="h-24 w-24">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke={customer.healthScore >= 80 ? '#10b981' : customer.healthScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${(customer.healthScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  transform="rotate(-90 48 48)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{customer.healthScore}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {customer.healthScore >= 80 ? 'Excellent' : customer.healthScore >= 60 ? 'Good' : 'At Risk'}
            </p>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-6 pt-6 border-t border-indigo-200">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Lifetime Value</p>
            <p className="text-2xl font-bold text-indigo-900">${(customer.lifetimeValue / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Monthly Recurring Revenue</p>
            <p className="text-2xl font-bold text-green-900">${(customer.currentMRR / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Customer Since</p>
            <p className="text-2xl font-bold text-purple-900">{new Date(customer.customerSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Avg CSAT Score</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-yellow-900">{avgCSAT.toFixed(1)}</p>
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'interactions', label: 'Interactions', icon: MessageSquare },
            { id: 'tickets', label: 'Support Tickets', icon: AlertCircle },
            { id: 'purchases', label: 'Purchase History', icon: ShoppingCart },
            { id: 'csat', label: 'CSAT Feedback', icon: Star }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Contract Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              Contract Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-semibold text-gray-900 capitalize">{customer.contractDetails.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Start Date:</span>
                <span className="text-sm font-semibold text-gray-900">{customer.contractDetails.startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">End Date:</span>
                <span className="text-sm font-semibold text-gray-900">{customer.contractDetails.endDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Annual Value:</span>
                <span className="text-sm font-semibold text-green-700">${customer.contractDetails.value.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Renewal Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  customer.contractDetails.renewalStatus === 'auto-renew' ? 'bg-green-100 text-green-700' :
                  customer.contractDetails.renewalStatus === 'manual-renew' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {customer.contractDetails.renewalStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
              <Activity className="h-5 w-5 text-purple-600 mr-2" />
              Recent Activity Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Interactions:</span>
                <span className="text-sm font-semibold text-gray-900">{customer.interactionHistory.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Open Tickets:</span>
                <span className="text-sm font-semibold text-gray-900">{customer.linkedTickets.filter(t => t.status !== 'resolved').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Purchases:</span>
                <span className="text-sm font-semibold text-gray-900">{customer.purchaseHistory.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CSAT Surveys:</span>
                <span className="text-sm font-semibold text-gray-900">{customer.csatScores.length} responses</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Contact:</span>
                <span className="text-sm font-semibold text-gray-900">{customer.interactionHistory[0]?.date ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interactions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Interaction History</h3>
          <div className="space-y-3">
            {customer.interactionHistory.map((interaction) => (
              <div key={interaction.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${
                        interaction.type === 'call' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                        interaction.type === 'email' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                        interaction.type === 'meeting' ? 'bg-green-100 text-green-700 border-green-300' :
                        interaction.type === 'support' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                        'bg-indigo-100 text-indigo-700 border-indigo-300'
                      }`}>
                        {interaction.type}
                      </span>
                      <span className="font-semibold text-gray-900">{interaction.subject}</span>
                    </div>
                    <p className="text-sm text-gray-600">📅 {interaction.date}</p>
                    {interaction.outcome && (
                      <p className="text-sm text-green-700 mt-1">✓ {interaction.outcome}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Linked Support Tickets</h3>
          <div className="space-y-3">
            {customer.linkedTickets.map((ticket) => (
              <div key={ticket.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-bold text-gray-900">{ticket.id}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[ticket.status]}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{ticket.subject}</p>
                    <p className="text-xs text-gray-500">Created: {ticket.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Purchase History & Product Ownership</h3>
          <div className="space-y-3">
            {customer.purchaseHistory.map((purchase) => (
              <div key={purchase.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-bold text-gray-900">{purchase.id}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[purchase.status]}`}>
                        {purchase.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{purchase.product}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-700 font-semibold">${purchase.amount.toLocaleString()}</span>
                      <span className="text-gray-500">📅 {purchase.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'csat' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Customer Satisfaction (CSAT) Scores</h3>
          <div className="space-y-2">
            {customer.csatScores.map((csat, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {[...Array(10)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < csat.score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-2xl font-bold text-yellow-900 ml-2">{csat.score}/10</span>
                  </div>
                  <span className="text-sm text-gray-500">{csat.date}</span>
                </div>
                <p className="text-sm text-gray-700 italic">"{csat.feedback}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
