'use client';

import React, { useState, useEffect } from 'react';
import { FinanceService } from '@/services/finance.service';
import { CreditCard, AlertTriangle, TrendingUp, Shield, Users, DollarSign, FileText, Clock, CheckCircle, XCircle, AlertCircle, Plus, X, Filter, Download, ChevronUp, ChevronDown, BarChart3, Activity, Calendar, Target, Eye, Lock, Unlock, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, Funnel, FunnelChart, ScatterChart, Scatter } from 'recharts';

interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  status: 'active' | 'inactive' | 'blocked' | 'under-review';
  industry: string;
  annualRevenue: number;
  employeeCount: number;
}

interface CreditProfile {
  customerId: string;
  creditLimit: number;
  currentExposure: number;
  availableCredit: number;
  creditScore: number;
  riskRating: 'low' | 'medium' | 'high' | 'very-high';
  paymentTerms: string;
  creditStatus: 'approved' | 'pending' | 'rejected' | 'suspended';
  lastReviewDate: string;
  nextReviewDate: string;
  collateralRequired: boolean;
  collateralAmount?: number;
  guarantorRequired: boolean;
  creditInsurance: boolean;
}

interface CreditApplication {
  id: string;
  customerId: string;
  requestedAmount: number;
  purpose: string;
  applicationDate: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  approvalLevel: 'auto' | 'level-1' | 'level-2' | 'committee';
  documents: string[];
  notes: string;
}

interface PaymentHistory {
  customerId: string;
  invoiceId: string;
  invoiceAmount: number;
  dueDate: string;
  paymentDate?: string;
  daysOverdue: number;
  status: 'paid' | 'overdue' | 'current' | 'disputed';
}

interface CreditAlert {
  id: string;
  customerId: string;
  type: 'limit-exceeded' | 'payment-overdue' | 'risk-increase' | 'document-expiry' | 'review-due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  date: string;
  acknowledged: boolean;
}

interface CreditTransaction {
  id: string;
  customerId: string;
  type: 'order' | 'payment' | 'credit-note' | 'adjustment';
  amount: number;
  date: string;
  referenceNumber: string;
  impactOnExposure: number;
  balanceAfter: number;
}

const CreditManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [riskFilter, setRiskFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creditProfiles, setCreditProfiles] = useState<CreditProfile[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await FinanceService.getReceivables()) as any[];
        const rows: any[] = Array.isArray(raw) ? raw : [];

        const mappedCustomers: Customer[] = rows.map((r: any, idx: number) => ({
          id: String(r?.id ?? r?.customerId ?? idx),
          companyName: r?.companyName ?? r?.customerName ?? r?.name ?? '',
          contactName: r?.contactName ?? '',
          email: r?.email ?? '',
          phone: r?.phone ?? '',
          address: r?.address ?? '',
          registrationDate: r?.registrationDate ?? '',
          status: (r?.status ?? 'active') as Customer['status'],
          industry: r?.industry ?? '',
          annualRevenue: r?.annualRevenue ?? 0,
          employeeCount: r?.employeeCount ?? 0,
        }));

        const mappedProfiles: CreditProfile[] = rows.map((r: any, idx: number) => {
          const creditLimit = r?.creditLimit ?? 0;
          const currentExposure = r?.currentExposure ?? r?.exposure ?? r?.outstandingBalance ?? r?.balance ?? 0;
          return {
            customerId: String(r?.id ?? r?.customerId ?? idx),
            creditLimit,
            currentExposure,
            availableCredit: r?.availableCredit ?? Math.max(creditLimit - currentExposure, 0),
            creditScore: r?.creditScore ?? 0,
            riskRating: (r?.riskRating ?? 'low') as CreditProfile['riskRating'],
            paymentTerms: r?.paymentTerms ?? '',
            creditStatus: (r?.creditStatus ?? 'approved') as CreditProfile['creditStatus'],
            lastReviewDate: r?.lastReviewDate ?? '',
            nextReviewDate: r?.nextReviewDate ?? '',
            collateralRequired: r?.collateralRequired ?? false,
            collateralAmount: r?.collateralAmount ?? undefined,
            guarantorRequired: r?.guarantorRequired ?? false,
            creditInsurance: r?.creditInsurance ?? false,
          };
        });

        if (!cancelled) {
          setCustomers(mappedCustomers);
          setCreditProfiles(mappedProfiles);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const creditApplications: CreditApplication[] = [
    { id: 'APP001', customerId: 'C003', requestedAmount: 300000, purpose: 'Inventory Purchase', applicationDate: '2024-03-25', status: 'under-review', approvalLevel: 'level-2', documents: ['financial_statements.pdf', 'bank_guarantee.pdf'], notes: 'Customer requesting credit limit increase' },
    { id: 'APP002', customerId: 'C001', requestedAmount: 100000, purpose: 'Seasonal Increase', applicationDate: '2024-03-20', status: 'approved', reviewedBy: 'John Manager', reviewDate: '2024-03-22', approvalLevel: 'level-1', documents: ['request_letter.pdf'], notes: 'Temporary increase approved' },
    { id: 'APP003', customerId: 'C005', requestedAmount: 150000, purpose: 'Business Expansion', applicationDate: '2024-03-18', status: 'rejected', reviewedBy: 'Credit Committee', reviewDate: '2024-03-19', approvalLevel: 'committee', documents: ['business_plan.pdf', 'financial_projections.xlsx'], notes: 'Poor payment history' }
  ];

  const paymentHistory: PaymentHistory[] = [
    { customerId: 'C001', invoiceId: 'INV-2024-001', invoiceAmount: 50000, dueDate: '2024-03-15', paymentDate: '2024-03-14', daysOverdue: 0, status: 'paid' },
    { customerId: 'C001', invoiceId: 'INV-2024-002', invoiceAmount: 75000, dueDate: '2024-03-30', daysOverdue: 0, status: 'current' },
    { customerId: 'C002', invoiceId: 'INV-2024-003', invoiceAmount: 125000, dueDate: '2024-03-10', paymentDate: '2024-03-12', daysOverdue: 2, status: 'paid' },
    { customerId: 'C003', invoiceId: 'INV-2024-004', invoiceAmount: 45000, dueDate: '2024-02-28', daysOverdue: 26, status: 'overdue' },
    { customerId: 'C003', invoiceId: 'INV-2024-005', invoiceAmount: 35000, dueDate: '2024-03-05', daysOverdue: 21, status: 'overdue' },
    { customerId: 'C004', invoiceId: 'INV-2024-006', invoiceAmount: 95000, dueDate: '2024-03-20', paymentDate: '2024-03-19', daysOverdue: 0, status: 'paid' },
    { customerId: 'C005', invoiceId: 'INV-2024-007', invoiceAmount: 25000, dueDate: '2024-01-31', daysOverdue: 54, status: 'disputed' }
  ];

  const creditAlerts: CreditAlert[] = [
    { id: 'ALERT001', customerId: 'C003', type: 'payment-overdue', severity: 'high', message: 'Payment overdue by 26 days - INV-2024-004', date: '2024-03-26', acknowledged: false },
    { id: 'ALERT002', customerId: 'C003', type: 'limit-exceeded', severity: 'critical', message: 'Credit exposure at 90% of limit', date: '2024-03-25', acknowledged: false },
    { id: 'ALERT003', customerId: 'C002', type: 'review-due', severity: 'medium', message: 'Credit review due in 30 days', date: '2024-03-24', acknowledged: true },
    { id: 'ALERT004', customerId: 'C005', type: 'risk-increase', severity: 'critical', message: 'Credit score dropped below threshold', date: '2024-03-23', acknowledged: false },
    { id: 'ALERT005', customerId: 'C004', type: 'document-expiry', severity: 'low', message: 'Insurance document expires in 60 days', date: '2024-03-22', acknowledged: true }
  ];

  const creditTransactions: CreditTransaction[] = [
    { id: 'TRX001', customerId: 'C001', type: 'order', amount: -75000, date: '2024-03-25', referenceNumber: 'ORD-2024-125', impactOnExposure: 75000, balanceAfter: 250000 },
    { id: 'TRX002', customerId: 'C001', type: 'payment', amount: 50000, date: '2024-03-24', referenceNumber: 'PAY-2024-089', impactOnExposure: -50000, balanceAfter: 175000 },
    { id: 'TRX003', customerId: 'C002', type: 'order', amount: -125000, date: '2024-03-23', referenceNumber: 'ORD-2024-124', impactOnExposure: 125000, balanceAfter: 750000 },
    { id: 'TRX004', customerId: 'C003', type: 'credit-note', amount: 5000, date: '2024-03-22', referenceNumber: 'CN-2024-015', impactOnExposure: -5000, balanceAfter: 175000 },
    { id: 'TRX005', customerId: 'C004', type: 'payment', amount: 95000, date: '2024-03-20', referenceNumber: 'PAY-2024-088', impactOnExposure: -95000, balanceAfter: 400000 }
  ];

  // Analytics data
  const creditUtilization = [
    { month: 'Jan', utilization: 65, limit: 2450000 },
    { month: 'Feb', utilization: 72, limit: 2450000 },
    { month: 'Mar', utilization: 68, limit: 2450000 },
    { month: 'Apr', utilization: 75, limit: 2500000 },
    { month: 'May', utilization: 70, limit: 2500000 },
    { month: 'Jun', utilization: 73, limit: 2550000 }
  ];

  const riskDistribution = [
    { risk: 'Low', count: 2, value: 1250000, percentage: 50 },
    { risk: 'Medium', count: 1, value: 750000, percentage: 30 },
    { risk: 'High', count: 1, value: 180000, percentage: 7 },
    { risk: 'Very High', count: 1, value: 50000, percentage: 2 }
  ];

  const agingAnalysis = [
    { category: 'Current', amount: 850000, percentage: 55 },
    { category: '1-30 days', amount: 350000, percentage: 23 },
    { category: '31-60 days', amount: 180000, percentage: 12 },
    { category: '61-90 days', amount: 80000, percentage: 5 },
    { category: '>90 days', amount: 75000, percentage: 5 }
  ];

  const paymentBehavior = [
    { score: 'Excellent (0 days)', customers: 2, percentage: 40 },
    { score: 'Good (1-7 days)', customers: 1, percentage: 20 },
    { score: 'Fair (8-30 days)', customers: 1, percentage: 20 },
    { score: 'Poor (>30 days)', customers: 1, percentage: 20 }
  ];

  const renderDashboardTab = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Credit Limit</p>
              <p className="text-2xl font-bold text-gray-900">$2.45M</p>
              <p className="text-xs text-gray-500">5 customers</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Exposure</p>
              <p className="text-2xl font-bold text-gray-900">$1.63M</p>
              <p className="text-xs text-gray-500">66.5% utilized</p>
            </div>
            <Activity className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-gray-900">$155K</p>
              <p className="text-xs text-gray-500">3 invoices</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Credit</p>
              <p className="text-2xl font-bold text-gray-900">$820K</p>
              <p className="text-xs text-gray-500">33.5% available</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Credit Utilization Trend</h3>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={creditUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                if (name === 'utilization') return `${value}%`;
                return `$${(Number(value) / 1000000).toFixed(2)}M`;
              }} />
              <Area type="monotone" dataKey="utilization" stroke="#3B82F6" fill="#93C5FD" name="Utilization %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ risk, percentage }) => `${risk} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10B981" />
                <Cell fill="#F59E0B" />
                <Cell fill="#EF4444" />
                <Cell fill="#991B1B" />
              </Pie>
              <Tooltip formatter={(value) => `$${new Intl.NumberFormat('en-US').format(Number(value))}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Credit Alerts</h3>
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
            {creditAlerts.filter(a => !a.acknowledged).length} Unacknowledged
          </span>
        </div>
        <div className="space-y-3">
          {creditAlerts.filter(a => !a.acknowledged).map(alert => {
            const customer = customers.find(c => c.id === alert.customerId);
            return (
              <div key={alert.id} className={`p-3 rounded-lg border ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className={`h-5 w-5 mr-3 ${
                      alert.severity === 'critical' ? 'text-red-600' :
                      alert.severity === 'high' ? 'text-orange-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <p className="font-medium">{customer?.companyName}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Acknowledge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Aging Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agingAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `$${new Intl.NumberFormat('en-US').format(Number(value))}`} />
              <Bar dataKey="amount" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Payment Behavior</h3>
          <div className="space-y-3">
            {paymentBehavior.map(behavior => (
              <div key={behavior.score} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{behavior.score}</span>
                    <span className="text-sm text-gray-500">{behavior.customers} customers</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        behavior.score.includes('Excellent') ? 'bg-green-500' :
                        behavior.score.includes('Good') ? 'bg-blue-500' :
                        behavior.score.includes('Fair') ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${behavior.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomersTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Customer Credit Profiles</h3>
          <div className="flex space-x-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="very-high">Very High Risk</option>
            </select>
            <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="text-center text-gray-500 py-4">Loading credit profiles...</p>
        )}
        {loadError && !isLoading && (
          <p className="text-center text-red-600 py-4">{loadError}</p>
        )}
        {!isLoading && !loadError && customers.length === 0 && (
          <p className="text-center text-gray-500 py-4">No customer credit profiles found.</p>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Credit Score</th>
                <th className="text-left py-2">Risk Rating</th>
                <th className="text-right py-2">Credit Limit</th>
                <th className="text-right py-2">Exposure</th>
                <th className="text-right py-2">Available</th>
                <th className="text-center py-2">Status</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => {
                const profile = creditProfiles.find(p => p.customerId === customer.id);
                if (!profile) return null;
                if (riskFilter !== 'all' && profile.riskRating !== riskFilter) return null;

                return (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <div>
                        <p className="font-semibold">{customer.companyName}</p>
                        <p className="text-sm text-gray-500">{customer.industry}</p>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">{profile.creditScore}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              profile.creditScore >= 700 ? 'bg-green-500' :
                              profile.creditScore >= 600 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(profile.creditScore / 850) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${
                        profile.riskRating === 'low' ? 'bg-green-100 text-green-800' :
                        profile.riskRating === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        profile.riskRating === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {profile.riskRating}
                      </span>
                    </td>
                    <td className="text-right py-2">
                      ${new Intl.NumberFormat('en-US').format(profile.creditLimit)}
                    </td>
                    <td className="text-right py-2">
                      <div>
                        <p className="font-semibold">
                          ${new Intl.NumberFormat('en-US').format(profile.currentExposure)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {((profile.currentExposure / profile.creditLimit) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </td>
                    <td className="text-right py-2">
                      ${new Intl.NumberFormat('en-US').format(profile.availableCredit)}
                    </td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        profile.creditStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        profile.creditStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        profile.creditStatus === 'suspended' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {profile.creditStatus}
                      </span>
                    </td>
                    <td className="text-center py-2">
                      <button
                        onClick={() => setSelectedCustomer(customer.id)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowLimitModal(true)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">
              Customer Details - {customers.find(c => c.id === selectedCustomer)?.companyName}
            </h3>
            <button onClick={() => setSelectedCustomer(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <h4 className="font-semibold mb-3">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Contact:</span> {customers.find(c => c.id === selectedCustomer)?.contactName}</p>
                <p><span className="text-gray-600">Email:</span> {customers.find(c => c.id === selectedCustomer)?.email}</p>
                <p><span className="text-gray-600">Phone:</span> {customers.find(c => c.id === selectedCustomer)?.phone}</p>
                <p><span className="text-gray-600">Address:</span> {customers.find(c => c.id === selectedCustomer)?.address}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Business Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Industry:</span> {customers.find(c => c.id === selectedCustomer)?.industry}</p>
                <p><span className="text-gray-600">Annual Revenue:</span> ${new Intl.NumberFormat('en-US').format(customers.find(c => c.id === selectedCustomer)?.annualRevenue || 0)}</p>
                <p><span className="text-gray-600">Employees:</span> {customers.find(c => c.id === selectedCustomer)?.employeeCount}</p>
                <p><span className="text-gray-600">Member Since:</span> {customers.find(c => c.id === selectedCustomer)?.registrationDate}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Credit Terms</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Payment Terms:</span> {creditProfiles.find(p => p.customerId === selectedCustomer)?.paymentTerms}</p>
                <p><span className="text-gray-600">Collateral Required:</span> {creditProfiles.find(p => p.customerId === selectedCustomer)?.collateralRequired ? 'Yes' : 'No'}</p>
                <p><span className="text-gray-600">Credit Insurance:</span> {creditProfiles.find(p => p.customerId === selectedCustomer)?.creditInsurance ? 'Yes' : 'No'}</p>
                <p><span className="text-gray-600">Next Review:</span> {creditProfiles.find(p => p.customerId === selectedCustomer)?.nextReviewDate}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Recent Transactions</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Reference</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {creditTransactions
                    .filter(t => t.customerId === selectedCustomer)
                    .slice(0, 5)
                    .map(transaction => (
                      <tr key={transaction.id} className="border-b">
                        <td className="py-2">{transaction.date}</td>
                        <td className="py-2">
                          <span className="capitalize">{transaction.type}</span>
                        </td>
                        <td className="py-2">{transaction.referenceNumber}</td>
                        <td className={`text-right py-2 ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString()}
                        </td>
                        <td className="text-right py-2">
                          ${transaction.balanceAfter.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderApplicationsTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Credit Applications</h3>
          <button
            onClick={() => setShowApplicationModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Application ID</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-right py-2">Amount Requested</th>
                <th className="text-left py-2">Purpose</th>
                <th className="text-left py-2">Date</th>
                <th className="text-center py-2">Status</th>
                <th className="text-center py-2">Approval Level</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creditApplications.map(application => {
                const customer = customers.find(c => c.id === application.customerId);
                return (
                  <tr key={application.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-mono text-sm">{application.id}</td>
                    <td className="py-2">{customer?.companyName}</td>
                    <td className="text-right py-2 font-semibold">
                      ${new Intl.NumberFormat('en-US').format(application.requestedAmount)}
                    </td>
                    <td className="py-2">{application.purpose}</td>
                    <td className="py-2">{application.applicationDate}</td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        application.status === 'approved' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        application.status === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="text-center py-2">
                      <span className="text-sm capitalize">{application.approvalLevel.replace('-', ' ')}</span>
                    </td>
                    <td className="text-center py-2">
                      {application.status === 'under-review' && (
                        <div className="flex justify-center space-x-2">
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Approve</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Reject</span>
                          </button>
                        </div>
                      )}
                      {application.status !== 'under-review' && (
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Application Pipeline</h3>
          <div className="space-y-3">
            {['draft', 'submitted', 'under-review', 'approved', 'rejected'].map(status => {
              const count = creditApplications.filter(a => a.status === status).length;
              const value = creditApplications
                .filter(a => a.status === status)
                .reduce((sum, a) => sum + a.requestedAmount, 0);
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      status === 'approved' ? 'bg-green-500' :
                      status === 'rejected' ? 'bg-red-500' :
                      status === 'under-review' ? 'bg-yellow-500' :
                      status === 'submitted' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{count}</p>
                    <p className="text-xs text-gray-500">
                      ${value > 0 ? `${(value / 1000).toFixed(0)}K` : '0'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Approval Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Approval Rate</span>
              <span className="font-semibold text-green-600">67%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg. Processing Time</span>
              <span className="font-semibold">2.5 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Reviews</span>
              <span className="font-semibold text-yellow-600">1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">This Month</span>
              <span className="font-semibold">3 applications</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Required Documents</h3>
          <div className="space-y-2">
            {['Financial Statements', 'Bank Guarantee', 'Business Plan', 'Tax Returns', 'Insurance Documents'].map(doc => (
              <div key={doc} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{doc}</span>
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Credit Score Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" domain={[400, 850]} />
              <YAxis dataKey="exposure" />
              <Tooltip formatter={(value, name) => {
                if (name === 'exposure') return `$${new Intl.NumberFormat('en-US').format(Number(value))}`;
                return value;
              }} />
              <Scatter
                name="Customers"
                data={creditProfiles.map(p => ({
                  score: p.creditScore,
                  exposure: p.currentExposure,
                  name: customers.find(c => c.id === p.customerId)?.companyName
                }))}
                fill="#3B82F6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Exposure by Risk Level</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={riskDistribution}>
              <RadialBar dataKey="value" fill="#3B82F6" />
              <Legend />
              <Tooltip formatter={(value) => `$${new Intl.NumberFormat('en-US').format(Number(value))}`} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Invoice</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-left py-2">Due Date</th>
                <th className="text-left py-2">Payment Date</th>
                <th className="text-center py-2">Days Overdue</th>
                <th className="text-center py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment, index) => {
                const customer = customers.find(c => c.id === payment.customerId);
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2">{customer?.companyName}</td>
                    <td className="py-2 font-mono text-sm">{payment.invoiceId}</td>
                    <td className="text-right py-2">
                      ${new Intl.NumberFormat('en-US').format(payment.invoiceAmount)}
                    </td>
                    <td className="py-2">{payment.dueDate}</td>
                    <td className="py-2">{payment.paymentDate || '-'}</td>
                    <td className="text-center py-2">
                      {payment.daysOverdue > 0 && (
                        <span className="text-red-600 font-semibold">{payment.daysOverdue}</span>
                      )}
                      {payment.daysOverdue === 0 && <span className="text-green-600">0</span>}
                    </td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'current' ? 'bg-blue-100 text-blue-800' :
                        payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Collection Efficiency</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">DSO (Days Sales Outstanding)</span>
              <span className="font-semibold">42 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Collection Rate</span>
              <span className="font-semibold text-green-600">94%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Bad Debt Rate</span>
              <span className="font-semibold text-red-600">2.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dispute Rate</span>
              <span className="font-semibold">3.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Risk Indicators</h3>
          <div className="space-y-3">
            {[
              { indicator: 'Credit Utilization', value: 66.5, threshold: 75, status: 'warning' },
              { indicator: 'Overdue Ratio', value: 9.5, threshold: 5, status: 'danger' },
              { indicator: 'Concentration Risk', value: 30, threshold: 40, status: 'safe' },
              { indicator: 'Coverage Ratio', value: 85, threshold: 80, status: 'safe' }
            ].map(item => (
              <div key={item.indicator} className="flex items-center justify-between">
                <span className="text-sm">{item.indicator}</span>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">{item.value}%</span>
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'safe' ? 'bg-green-500' :
                    item.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Credit Reviews</h3>
          <div className="space-y-2">
            {customers.map(customer => {
              const profile = creditProfiles.find(p => p.customerId === customer.id);
              if (!profile) return null;
              const daysUntilReview = Math.floor((new Date(profile.nextReviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={customer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{customer.companyName}</span>
                  <span className={`text-sm ${daysUntilReview <= 30 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {daysUntilReview} days
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Credit Management</h2>
        <p className="text-gray-600">Manage customer credit limits, monitor exposure, and track payment behavior</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-3">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['dashboard', 'customers', 'applications', 'monitoring'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-6 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div>
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'customers' && renderCustomersTab()}
        {activeTab === 'applications' && renderApplicationsTab()}
        {activeTab === 'monitoring' && renderMonitoringTab()}
      </div>

      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">New Credit Application</h3>
              <button onClick={() => setShowApplicationModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <select className="w-full border rounded px-3 py-2">
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Requested Amount</label>
                  <input type="number" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purpose</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Inventory Purchase</option>
                  <option>Business Expansion</option>
                  <option>Seasonal Increase</option>
                  <option>Working Capital</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supporting Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, XLSX, DOC up to 10MB</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Update Credit Limit</h3>
              <button onClick={() => setShowLimitModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">New Credit Limit</label>
                <input type="number" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Effective Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Change</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3}></textarea>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  This change requires approval from the credit committee.
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Submit for Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditManagement;