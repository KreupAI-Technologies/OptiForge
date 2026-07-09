'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Lock, Unlock, CheckCircle, XCircle, AlertTriangle, Clock, Play, Pause, RotateCcw, ChevronRight, FileText, Settings, Users, Shield, Activity, TrendingUp, Database, RefreshCw, Plus, X, Filter, Download, Eye, Check, AlertCircle } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';

interface FinancialPeriod {
  id: string;
  periodName: string;
  year: number;
  month?: number;
  quarter?: number;
  startDate: string;
  endDate: string;
  status: 'future' | 'open' | 'soft-close' | 'hard-close' | 'archived';
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  closingDeadline: string;
  actualClosedDate?: string;
  closedBy?: string;
  reopenedDate?: string;
  reopenedBy?: string;
  reopenReason?: string;
}

interface ClosingTask {
  id: string;
  periodId: string;
  taskName: string;
  category: 'reconciliation' | 'adjustment' | 'review' | 'approval' | 'reporting' | 'compliance';
  sequence: number;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
  actualHours?: number;
  dueDate: string;
  completedDate?: string;
  dependencies: string[];
  automated: boolean;
  notes?: string;
}

interface ClosingChecklist {
  id: string;
  periodId: string;
  checkItem: string;
  category: string;
  isCompleted: boolean;
  completedBy?: string;
  completedDate?: string;
  isMandatory: boolean;
  verificationRequired: boolean;
  verifiedBy?: string;
  comments?: string;
}

interface JournalEntry {
  id: string;
  periodId: string;
  entryDate: string;
  type: 'standard' | 'adjusting' | 'closing' | 'reversing';
  description: string;
  debitTotal: number;
  creditTotal: number;
  status: 'draft' | 'posted' | 'approved' | 'reversed';
  createdBy: string;
  approvedBy?: string;
  lines: number;
}

interface PeriodMetrics {
  periodId: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  assets: number;
  liabilities: number;
  equity: number;
  journalEntries: number;
  adjustments: number;
  exceptionsCount: number;
  complianceScore: number;
}

interface AuditLog {
  id: string;
  periodId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure';
}

const FinancialPeriodManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<FinancialPeriod | null>(null);
  const [showClosingWizard, setShowClosingWizard] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [closingStep, setClosingStep] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2024);

  // Financial periods loaded from the API
  const [financialPeriods, setFinancialPeriods] = useState<FinancialPeriod[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodsError, setPeriodsError] = useState<string | null>(null);

  const mapPeriodStatus = (s: any): FinancialPeriod['status'] => {
    const v = String(s || '').toLowerCase().replace(/[_\s]/g, '-');
    if (v.includes('hard') || v === 'closed' || v.includes('lock')) return 'hard-close';
    if (v.includes('soft')) return 'soft-close';
    if (v.includes('archiv')) return 'archived';
    if (v.includes('future') || v.includes('upcoming')) return 'future';
    return 'open';
  };

  const mapPeriodType = (t: any): FinancialPeriod['type'] => {
    const v = String(t || '').toLowerCase();
    if (v.includes('quarter')) return 'quarterly';
    if (v.includes('annual') || v.includes('year')) return 'annual';
    if (v.includes('custom')) return 'custom';
    return 'monthly';
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPeriodsLoading(true);
      setPeriodsError(null);
      try {
        const raw = await FinanceService.getFinancialPeriods();
        if (cancelled) return;
        const list = Array.isArray(raw) ? raw : [];
        const mapped: FinancialPeriod[] = list.map((p: any) => {
          const start = String(p.startDate ?? '');
          const yr = Number(String(start).slice(0, 4)) || new Date().getFullYear();
          return {
            id: String(p.id),
            periodName: String(p.periodName ?? p.periodCode ?? ''),
            year: yr,
            month: p.periodNumber != null ? Number(p.periodNumber) : undefined,
            startDate: start,
            endDate: String(p.endDate ?? ''),
            status: mapPeriodStatus(p.status),
            type: mapPeriodType(p.periodType),
            closingDeadline: String(p.closingDeadline ?? p.endDate ?? ''),
            actualClosedDate: p.actualClosedDate ?? undefined,
            closedBy: p.closedBy ?? undefined,
          };
        });
        setFinancialPeriods(mapped);
      } catch (err) {
        if (!cancelled) {
          setPeriodsError(err instanceof Error ? err.message : 'Failed to load financial periods');
          setFinancialPeriods([]);
        }
      } finally {
        if (!cancelled) setPeriodsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const closingTasks: ClosingTask[] = [
    { id: 'CT001', periodId: 'FP003', taskName: 'Bank Reconciliation', category: 'reconciliation', sequence: 1, assignedTo: 'Jane Smith', status: 'completed', priority: 'high', estimatedHours: 4, actualHours: 3.5, dueDate: '2024-04-05', completedDate: '2024-04-04', dependencies: [], automated: false },
    { id: 'CT002', periodId: 'FP003', taskName: 'Inventory Count Adjustment', category: 'adjustment', sequence: 2, assignedTo: 'Mike Johnson', status: 'completed', priority: 'high', estimatedHours: 6, actualHours: 5, dueDate: '2024-04-06', completedDate: '2024-04-05', dependencies: ['CT001'], automated: false },
    { id: 'CT003', periodId: 'FP003', taskName: 'Depreciation Calculation', category: 'adjustment', sequence: 3, assignedTo: 'System', status: 'completed', priority: 'medium', estimatedHours: 1, actualHours: 1, dueDate: '2024-04-06', completedDate: '2024-04-06', dependencies: [], automated: true },
    { id: 'CT004', periodId: 'FP003', taskName: 'Accruals Review', category: 'review', sequence: 4, assignedTo: 'Sarah Wilson', status: 'in-progress', priority: 'high', estimatedHours: 3, dueDate: '2024-04-07', dependencies: ['CT002', 'CT003'], automated: false },
    { id: 'CT005', periodId: 'FP003', taskName: 'Management Review', category: 'approval', sequence: 5, assignedTo: 'Robert Brown', status: 'pending', priority: 'critical', estimatedHours: 2, dueDate: '2024-04-08', dependencies: ['CT004'], automated: false },
    { id: 'CT006', periodId: 'FP003', taskName: 'Financial Reports Generation', category: 'reporting', sequence: 6, assignedTo: 'System', status: 'pending', priority: 'high', estimatedHours: 2, dueDate: '2024-04-09', dependencies: ['CT005'], automated: true }
  ];

  const closingChecklist: ClosingChecklist[] = [
    { id: 'CL001', periodId: 'FP003', checkItem: 'All invoices recorded', category: 'Revenue', isCompleted: true, completedBy: 'Jane Smith', completedDate: '2024-04-03', isMandatory: true, verificationRequired: true, verifiedBy: 'John Doe' },
    { id: 'CL002', periodId: 'FP003', checkItem: 'All expenses captured', category: 'Expenses', isCompleted: true, completedBy: 'Mike Johnson', completedDate: '2024-04-04', isMandatory: true, verificationRequired: true, verifiedBy: 'John Doe' },
    { id: 'CL003', periodId: 'FP003', checkItem: 'Bank statements reconciled', category: 'Cash', isCompleted: true, completedBy: 'Jane Smith', completedDate: '2024-04-04', isMandatory: true, verificationRequired: true, verifiedBy: 'Sarah Wilson' },
    { id: 'CL004', periodId: 'FP003', checkItem: 'Fixed assets verified', category: 'Assets', isCompleted: false, isMandatory: true, verificationRequired: true },
    { id: 'CL005', periodId: 'FP003', checkItem: 'Tax provisions calculated', category: 'Tax', isCompleted: false, isMandatory: true, verificationRequired: true },
    { id: 'CL006', periodId: 'FP003', checkItem: 'Intercompany transactions eliminated', category: 'Consolidation', isCompleted: false, isMandatory: false, verificationRequired: false }
  ];

  const journalEntries: JournalEntry[] = [
    { id: 'JE001', periodId: 'FP003', entryDate: '2024-03-31', type: 'adjusting', description: 'Accrued expenses adjustment', debitTotal: 45000, creditTotal: 45000, status: 'posted', createdBy: 'Jane Smith', approvedBy: 'John Doe', lines: 4 },
    { id: 'JE002', periodId: 'FP003', entryDate: '2024-03-31', type: 'adjusting', description: 'Depreciation expense', debitTotal: 25000, creditTotal: 25000, status: 'posted', createdBy: 'System', approvedBy: 'Auto', lines: 8 },
    { id: 'JE003', periodId: 'FP003', entryDate: '2024-03-31', type: 'closing', description: 'Revenue closing entry', debitTotal: 500000, creditTotal: 500000, status: 'approved', createdBy: 'Jane Smith', approvedBy: 'John Doe', lines: 12 },
    { id: 'JE004', periodId: 'FP003', entryDate: '2024-03-31', type: 'closing', description: 'Expense closing entry', debitTotal: 350000, creditTotal: 350000, status: 'draft', createdBy: 'Jane Smith', lines: 15 },
    { id: 'JE005', periodId: 'FP003', entryDate: '2024-04-01', type: 'reversing', description: 'Reverse accruals', debitTotal: 15000, creditTotal: 15000, status: 'draft', createdBy: 'System', lines: 3 }
  ];

  const periodMetrics: PeriodMetrics[] = [
    { periodId: 'FP001', revenue: 4500000, expenses: 3200000, netIncome: 1300000, assets: 25000000, liabilities: 10000000, equity: 15000000, journalEntries: 450, adjustments: 25, exceptionsCount: 3, complianceScore: 98 },
    { periodId: 'FP002', revenue: 4800000, expenses: 3400000, netIncome: 1400000, assets: 26000000, liabilities: 10500000, equity: 15500000, journalEntries: 480, adjustments: 28, exceptionsCount: 2, complianceScore: 99 },
    { periodId: 'FP003', revenue: 5000000, expenses: 3500000, netIncome: 1500000, assets: 27000000, liabilities: 11000000, equity: 16000000, journalEntries: 320, adjustments: 18, exceptionsCount: 5, complianceScore: 95 }
  ];

  const auditLogs: AuditLog[] = [
    { id: 'AL001', periodId: 'FP003', action: 'Period Soft Close Initiated', performedBy: 'Jane Smith', timestamp: '2024-04-06 14:30:00', details: 'Started soft close process for March 2024', ipAddress: '192.168.1.100', status: 'success' },
    { id: 'AL002', periodId: 'FP003', action: 'Journal Entry Posted', performedBy: 'Jane Smith', timestamp: '2024-04-06 15:15:00', details: 'Posted adjusting entry JE001', ipAddress: '192.168.1.100', status: 'success' },
    { id: 'AL003', periodId: 'FP003', action: 'Checklist Item Completed', performedBy: 'Mike Johnson', timestamp: '2024-04-06 16:00:00', details: 'Completed expense capture verification', ipAddress: '192.168.1.101', status: 'success' },
    { id: 'AL004', periodId: 'FP002', action: 'Period Reopened', performedBy: 'John Doe', timestamp: '2024-04-05 09:00:00', details: 'Reopened February 2024 for adjustment', ipAddress: '192.168.1.102', status: 'success' },
    { id: 'AL005', periodId: 'FP002', action: 'Period Hard Closed', performedBy: 'John Doe', timestamp: '2024-04-05 17:00:00', details: 'Completed hard close for February 2024', ipAddress: '192.168.1.102', status: 'success' }
  ];

  // Analytics data
  const closingTrend = [
    { month: 'Jan', plannedDays: 10, actualDays: 8 },
    { month: 'Feb', plannedDays: 10, actualDays: 9 },
    { month: 'Mar', plannedDays: 10, actualDays: 7 },
    { month: 'Apr', plannedDays: 10, actualDays: null },
    { month: 'May', plannedDays: 10, actualDays: null },
    { month: 'Jun', plannedDays: 10, actualDays: null }
  ];

  const taskProgress = [
    { category: 'Reconciliation', completed: 8, total: 8, percentage: 100 },
    { category: 'Adjustments', completed: 5, total: 6, percentage: 83 },
    { category: 'Reviews', completed: 2, total: 4, percentage: 50 },
    { category: 'Approvals', completed: 0, total: 3, percentage: 0 },
    { category: 'Reporting', completed: 0, total: 5, percentage: 0 }
  ];

  const complianceMetrics = [
    { metric: 'On-time Closings', value: 92, target: 95, status: 'warning' },
    { metric: 'Compliance Score', value: 97, target: 95, status: 'good' },
    { metric: 'Exception Rate', value: 2.5, target: 5, status: 'good' },
    { metric: 'Automation Rate', value: 65, target: 70, status: 'warning' }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Periods</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-xs text-gray-500">Apr 2024, Q1 2024</p>
            </div>
            <Unlock className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Soft Close</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-xs text-gray-500">Mar 2024</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hard Closed</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-xs text-gray-500">Jan, Feb 2024</p>
            </div>
            <Lock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Close Time</p>
              <p className="text-2xl font-bold text-gray-900">8 days</p>
              <p className="text-xs text-gray-500">20% faster</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Period Status Timeline</h3>
          {periodsLoading && (
            <p className="text-center text-gray-500 py-4">Loading financial periods...</p>
          )}
          {periodsError && !periodsLoading && (
            <p className="text-center text-red-600 py-4">{periodsError}</p>
          )}
          {!periodsLoading && !periodsError && financialPeriods.length === 0 && (
            <p className="text-center text-gray-500 py-4">No financial periods found.</p>
          )}
          <div className="space-y-3">
            {financialPeriods.slice(0, 6).map((period, index) => (
              <div key={period.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  period.status === 'hard-close' ? 'bg-blue-100 text-blue-600' :
                  period.status === 'soft-close' ? 'bg-yellow-100 text-yellow-600' :
                  period.status === 'open' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {period.status === 'hard-close' ? <Lock className="h-5 w-5" /> :
                   period.status === 'soft-close' ? <Clock className="h-5 w-5" /> :
                   period.status === 'open' ? <Unlock className="h-5 w-5" /> :
                   <Calendar className="h-5 w-5" />}
                </div>
                <div className="flex-1 ml-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{period.periodName}</p>
                      <p className="text-sm text-gray-500">
                        {period.startDate} - {period.endDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs capitalize ${
                        period.status === 'hard-close' ? 'bg-blue-100 text-blue-800' :
                        period.status === 'soft-close' ? 'bg-yellow-100 text-yellow-800' :
                        period.status === 'open' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {period.status.replace('-', ' ')}
                      </span>
                      {period.actualClosedDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Closed: {period.actualClosedDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {index < financialPeriods.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Closing Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={closingTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="plannedDays" stroke="#94A3B8" fill="#E2E8F0" name="Planned" />
              <Area type="monotone" dataKey="actualDays" stroke="#3B82F6" fill="#93C5FD" name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Current Period Tasks</h3>
          <button
            onClick={() => setShowClosingWizard(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Closing
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <h4 className="font-medium mb-3">Task Progress by Category</h4>
            <div className="space-y-2">
              {taskProgress.map(task => (
                <div key={task.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{task.category}</span>
                    <span className="text-gray-500">{task.completed}/{task.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        task.percentage === 100 ? 'bg-green-500' :
                        task.percentage >= 50 ? 'bg-blue-500' :
                        task.percentage > 0 ? 'bg-yellow-500' :
                        'bg-gray-300'
                      }`}
                      style={{ width: `${task.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Key Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              {complianceMetrics.map(metric => (
                <div key={metric.metric} className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">{metric.metric}</p>
                  <p className="text-lg font-semibold mt-1">
                    {metric.value}{metric.metric.includes('Rate') ? '%' : ''}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">Target: {metric.target}</span>
                    <div className={`ml-2 w-2 h-2 rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPeriodsTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Financial Periods</h3>
          <div className="flex space-x-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Period
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Period</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Date Range</th>
                <th className="text-left py-2">Closing Deadline</th>
                <th className="text-center py-2">Status</th>
                <th className="text-left py-2">Closed By</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {financialPeriods.map(period => (
                <tr key={period.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{period.periodName}</td>
                  <td className="py-2 capitalize">{period.type}</td>
                  <td className="py-2">{period.startDate} to {period.endDate}</td>
                  <td className="py-2">{period.closingDeadline}</td>
                  <td className="text-center py-2">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                      period.status === 'hard-close' ? 'bg-blue-100 text-blue-800' :
                      period.status === 'soft-close' ? 'bg-yellow-100 text-yellow-800' :
                      period.status === 'open' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {period.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-2">
                    {period.closedBy || '-'}
                    {period.actualClosedDate && (
                      <p className="text-xs text-gray-500">{period.actualClosedDate}</p>
                    )}
                  </td>
                  <td className="text-center py-2">
                    <div className="flex justify-center space-x-2">
                      {period.status === 'open' && (
                        <button
                          onClick={() => {
                            setSelectedPeriod(period);
                            setShowClosingWizard(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {period.status === 'hard-close' && (
                        <button
                          onClick={() => {
                            setSelectedPeriod(period);
                            setShowReopenModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedPeriod(period)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPeriod && (
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Period Details - {selectedPeriod.periodName}</h3>
            <button onClick={() => setSelectedPeriod(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <h4 className="font-medium mb-3">Period Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Period ID:</span> {selectedPeriod.id}</p>
                <p><span className="text-gray-600">Type:</span> {selectedPeriod.type}</p>
                <p><span className="text-gray-600">Year:</span> {selectedPeriod.year}</p>
                <p><span className="text-gray-600">Status:</span> {selectedPeriod.status}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Key Dates</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Start Date:</span> {selectedPeriod.startDate}</p>
                <p><span className="text-gray-600">End Date:</span> {selectedPeriod.endDate}</p>
                <p><span className="text-gray-600">Deadline:</span> {selectedPeriod.closingDeadline}</p>
                <p><span className="text-gray-600">Closed:</span> {selectedPeriod.actualClosedDate || 'Not closed'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Period Metrics</h4>
              <div className="space-y-2 text-sm">
                {periodMetrics.find(m => m.periodId === selectedPeriod.id) && (
                  <>
                    <p><span className="text-gray-600">Journal Entries:</span> {periodMetrics.find(m => m.periodId === selectedPeriod.id)?.journalEntries}</p>
                    <p><span className="text-gray-600">Adjustments:</span> {periodMetrics.find(m => m.periodId === selectedPeriod.id)?.adjustments}</p>
                    <p><span className="text-gray-600">Exceptions:</span> {periodMetrics.find(m => m.periodId === selectedPeriod.id)?.exceptionsCount}</p>
                    <p><span className="text-gray-600">Compliance:</span> {periodMetrics.find(m => m.periodId === selectedPeriod.id)?.complianceScore}%</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Recent Activities</h4>
            <div className="space-y-2">
              {auditLogs
                .filter(log => log.periodId === selectedPeriod.id)
                .slice(0, 5)
                .map(log => (
                  <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.performedBy} • {log.timestamp}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Closing Tasks</h3>
          <div className="flex space-x-2">
            <select className="border rounded px-3 py-2">
              <option>March 2024</option>
              <option>February 2024</option>
              <option>January 2024</option>
            </select>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Sequence</th>
                <th className="text-left py-2">Task</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Assigned To</th>
                <th className="text-center py-2">Priority</th>
                <th className="text-center py-2">Status</th>
                <th className="text-left py-2">Due Date</th>
                <th className="text-center py-2">Automated</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {closingTasks.map(task => (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 text-center">{task.sequence}</td>
                  <td className="py-2 font-medium">{task.taskName}</td>
                  <td className="py-2 capitalize">{task.category}</td>
                  <td className="py-2">{task.assignedTo}</td>
                  <td className="text-center py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="text-center py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-2">{task.dueDate}</td>
                  <td className="text-center py-2">
                    {task.automated ? (
                      <CheckCircle className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 inline" />
                    )}
                  </td>
                  <td className="text-center py-2">
                    {task.status === 'pending' && (
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm">
                        <Play className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-600">Start</span>
                      </button>
                    )}
                    {task.status === 'in-progress' && (
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Complete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Task Dependencies</h3>
          <div className="space-y-3">
            {closingTasks.filter(t => t.dependencies.length > 0).map(task => (
              <div key={task.id} className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-sm">{task.taskName}</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-600">Depends on:</span>
                  {task.dependencies.map(dep => {
                    const depTask = closingTasks.find(t => t.id === dep);
                    return (
                      <span key={dep} className="ml-2 px-2 py-1 bg-white rounded text-xs">
                        {depTask?.taskName}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Task Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={closingTasks.filter(t => t.actualHours)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="taskName" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="estimatedHours" fill="#94A3B8" name="Estimated" />
              <Bar dataKey="actualHours" fill="#3B82F6" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderChecklistTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Closing Checklist</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Completed: {closingChecklist.filter(c => c.isCompleted).length}/{closingChecklist.length}
            </span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Save Checklist
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {['Revenue', 'Expenses', 'Cash', 'Assets', 'Tax', 'Consolidation'].map(category => {
            const items = closingChecklist.filter(c => c.category === category);
            const completedItems = items.filter(c => c.isCompleted).length;

            return (
              <div key={category} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{category}</h4>
                  <span className="text-sm text-gray-500">{completedItems}/{items.length} completed</span>
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        readOnly
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {item.checkItem}
                            {item.isMandatory && <span className="text-red-500 ml-1">*</span>}
                          </p>
                          {item.verificationRequired && (
                            <Shield className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        {item.isCompleted && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed by {item.completedBy} on {item.completedDate}
                            {item.verifiedBy && ` • Verified by ${item.verifiedBy}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Checklist Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={[
              { name: 'Completed', value: (closingChecklist.filter(c => c.isCompleted).length / closingChecklist.length) * 100, fill: '#10B981' }
            ]}>
              <RadialBar dataKey="value" />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold">
                {Math.round((closingChecklist.filter(c => c.isCompleted).length / closingChecklist.length) * 100)}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Mandatory Items</h3>
          <div className="space-y-2">
            {closingChecklist.filter(c => c.isMandatory && !c.isCompleted).map(item => (
              <div key={item.id} className="p-2 bg-red-50 rounded">
                <p className="text-sm font-medium">{item.checkItem}</p>
                <p className="text-xs text-gray-600">{item.category}</p>
              </div>
            ))}
            {closingChecklist.filter(c => c.isMandatory && !c.isCompleted).length === 0 && (
              <div className="text-center py-4 text-green-600">
                <CheckCircle className="h-8 w-8 mb-2" />
                <p className="text-sm">All mandatory items completed!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Pending Verifications</h3>
          <div className="space-y-2">
            {closingChecklist.filter(c => c.isCompleted && c.verificationRequired && !c.verifiedBy).map(item => (
              <div key={item.id} className="p-2 bg-yellow-50 rounded">
                <p className="text-sm font-medium">{item.checkItem}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-600">{item.category}</p>
                  <button className="text-xs text-blue-600 hover:text-blue-800">Verify</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderJournalEntriesTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Period Journal Entries</h3>
          <div className="flex space-x-2">
            <select className="border rounded px-3 py-2">
              <option>All Types</option>
              <option>Standard</option>
              <option>Adjusting</option>
              <option>Closing</option>
              <option>Reversing</option>
            </select>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Entry ID</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Debit</th>
                <th className="text-right py-2">Credit</th>
                <th className="text-center py-2">Lines</th>
                <th className="text-center py-2">Status</th>
                <th className="text-left py-2">Created By</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map(entry => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-mono text-sm">{entry.id}</td>
                  <td className="py-2">{entry.entryDate}</td>
                  <td className="py-2">
                    <span className="capitalize">{entry.type}</span>
                  </td>
                  <td className="py-2">{entry.description}</td>
                  <td className="text-right py-2">
                    ${new Intl.NumberFormat('en-US').format(entry.debitTotal)}
                  </td>
                  <td className="text-right py-2">
                    ${new Intl.NumberFormat('en-US').format(entry.creditTotal)}
                  </td>
                  <td className="text-center py-2">{entry.lines}</td>
                  <td className="text-center py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === 'posted' ? 'bg-green-100 text-green-800' :
                      entry.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      entry.status === 'reversed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-2">
                    {entry.createdBy}
                    {entry.approvedBy && (
                      <p className="text-xs text-gray-500">Approved: {entry.approvedBy}</p>
                    )}
                  </td>
                  <td className="text-center py-2">
                    {entry.status === 'draft' && (
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Approve</span>
                      </button>
                    )}
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm ml-2">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Entry Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Entries</span>
              <span className="font-semibold">{journalEntries.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Posted</span>
              <span className="font-semibold text-green-600">
                {journalEntries.filter(e => e.status === 'posted').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Approval</span>
              <span className="font-semibold text-yellow-600">
                {journalEntries.filter(e => e.status === 'draft' || e.status === 'approved').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Lines</span>
              <span className="font-semibold">
                {journalEntries.reduce((sum, e) => sum + e.lines, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Entry Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie dataKey="value"
                data={[
                  { name: 'Standard', value: journalEntries.filter(e => e.type === 'standard').length },
                  { name: 'Adjusting', value: journalEntries.filter(e => e.type === 'adjusting').length },
                  { name: 'Closing', value: journalEntries.filter(e => e.type === 'closing').length },
                  { name: 'Reversing', value: journalEntries.filter(e => e.type === 'reversing').length }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                label
              >
                <Cell fill="#3B82F6" />
                <Cell fill="#10B981" />
                <Cell fill="#F59E0B" />
                <Cell fill="#EF4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Balance Check</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Debits</span>
                <span className="font-semibold">
                  ${new Intl.NumberFormat('en-US').format(
                    journalEntries.reduce((sum, e) => sum + e.debitTotal, 0)
                  )}
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Credits</span>
                <span className="font-semibold">
                  ${new Intl.NumberFormat('en-US').format(
                    journalEntries.reduce((sum, e) => sum + e.creditTotal, 0)
                  )}
                </span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Balance</span>
                <span className="font-bold text-green-600">
                  Balanced ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Period Management</h2>
        <p className="text-gray-600">Manage financial periods, closing procedures, and compliance</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-3">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'periods', 'tasks', 'checklist', 'journal-entries'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-6 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'periods' && renderPeriodsTab()}
        {activeTab === 'tasks' && renderTasksTab()}
        {activeTab === 'checklist' && renderChecklistTab()}
        {activeTab === 'journal-entries' && renderJournalEntriesTab()}
      </div>

      {showClosingWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Period Closing Wizard</h3>
              <button onClick={() => setShowClosingWizard(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 h-1 bg-gray-200 top-5"></div>
                  <div
                    className="absolute left-0 h-1 bg-blue-500 top-5 transition-all"
                    style={{ width: `${(closingStep - 1) * 25}%` }}
                  />
                  {['Pre-Check', 'Reconciliation', 'Adjustments', 'Review', 'Close'].map((step, index) => (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index + 1 <= closingStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-xs mt-2">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {closingStep === 1 && (
                <div>
                  <h4 className="font-semibold mb-3">Pre-Closing Checks</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between">
                        <span>All transactions recorded</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between">
                        <span>Bank statements available</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between">
                        <span>Previous period closed</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded">
                      <div className="flex items-center justify-between">
                        <span>Pending approvals (2 items)</span>
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {closingStep === 2 && (
                <div>
                  <h4 className="font-semibold mb-3">Reconciliation Tasks</h4>
                  <div className="space-y-3">
                    {closingTasks.filter(t => t.category === 'reconciliation').map(task => (
                      <div key={task.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{task.taskName}</p>
                            <p className="text-sm text-gray-500">Assigned to: {task.assignedTo}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {closingStep === 5 && (
                <div>
                  <h4 className="font-semibold mb-3">Closing Summary</h4>
                  <div className="bg-green-50 p-3 rounded mb-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium">Ready to Close</p>
                        <p className="text-sm text-gray-600">All checks passed. Period can be closed.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Period:</span> March 2024</p>
                    <p className="text-sm"><span className="font-medium">Tasks Completed:</span> 26/26</p>
                    <p className="text-sm"><span className="font-medium">Checklist Items:</span> 15/15</p>
                    <p className="text-sm"><span className="font-medium">Journal Entries:</span> 5 posted</p>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">I confirm all closing procedures have been completed</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={() => closingStep > 1 && setClosingStep(closingStep - 1)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={closingStep === 1}
              >
                Previous
              </button>
              {closingStep < 5 ? (
                <button
                  onClick={() => setClosingStep(closingStep + 1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowClosingWizard(false);
                    setClosingStep(1);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Close Period
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showReopenModal && selectedPeriod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Reopen Period</h3>
              <button onClick={() => setShowReopenModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="bg-yellow-50 p-3 rounded">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Warning</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Reopening a closed period should only be done for critical adjustments.
                      This action will be logged and may require additional approvals.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Period to Reopen</label>
                <input
                  type="text"
                  value={selectedPeriod.periodName}
                  disabled
                  className="w-full border rounded px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Reopening</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Please provide a detailed reason..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Approval Required From</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>CFO - Michael Thompson</option>
                  <option>Controller - Sarah Martinez</option>
                  <option>Audit Committee</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Request Reopening
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialPeriodManagement;