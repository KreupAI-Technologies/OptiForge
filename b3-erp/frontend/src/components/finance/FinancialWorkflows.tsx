'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, Users, Shield, Clock, CheckCircle, XCircle, AlertCircle, Play, Pause, SkipForward, RotateCcw, Eye, Plus, X, Filter, Download, ChevronRight, ChevronDown, User, Lock, Unlock, Activity, TrendingUp, Calendar, Target, FileText, Settings, Bell } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Sankey, Treemap, RadialBarChart, RadialBar } from 'recharts';

interface Workflow {
  id: string;
  name: string;
  type: 'approval' | 'review' | 'notification' | 'escalation' | 'delegation';
  category: 'invoice' | 'payment' | 'expense' | 'journal' | 'budget' | 'purchase' | 'general';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: string;
  createdDate: string;
  modifiedDate: string;
  description: string;
  triggers: WorkflowTrigger[];
  stages: WorkflowStage[];
  rules: ApprovalRule[];
}

interface WorkflowTrigger {
  id: string;
  type: 'amount' | 'document' | 'schedule' | 'event' | 'condition';
  operator: 'equals' | 'greater' | 'less' | 'between' | 'contains';
  value: any;
  field?: string;
  description: string;
}

interface WorkflowStage {
  id: string;
  sequence: number;
  name: string;
  type: 'approval' | 'review' | 'notification' | 'action';
  assignmentType: 'user' | 'role' | 'group' | 'dynamic';
  assignedTo: string[];
  sla: number; // hours
  escalationTo?: string;
  conditions?: StageCondition[];
  actions?: StageAction[];
  parallel: boolean;
}

interface StageCondition {
  field: string;
  operator: string;
  value: any;
  nextStage?: string;
}

interface StageAction {
  type: 'email' | 'system' | 'integration' | 'script';
  action: string;
  parameters?: any;
}

interface ApprovalRule {
  id: string;
  name: string;
  type: 'amount' | 'hierarchy' | 'matrix' | 'custom';
  conditions: RuleCondition[];
  approvers: Approver[];
  escalation: boolean;
  autoApprove: boolean;
  autoReject: boolean;
}

interface RuleCondition {
  field: string;
  operator: string;
  value: any;
  logic: 'and' | 'or';
}

interface Approver {
  id: string;
  name: string;
  role: string;
  type: 'primary' | 'alternate' | 'escalation';
  level: number;
  limitAmount?: number;
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  documentId: string;
  documentType: string;
  documentAmount?: number;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  currentStage: number;
  initiatedBy: string;
  initiatedDate: string;
  completedDate?: string;
  history: WorkflowHistory[];
}

interface WorkflowHistory {
  stage: string;
  action: 'approved' | 'rejected' | 'returned' | 'escalated' | 'delegated';
  actionBy: string;
  actionDate: string;
  comments?: string;
  duration: number; // minutes
}

interface DelegationRule {
  id: string;
  fromUser: string;
  toUser: string;
  startDate: string;
  endDate: string;
  workflowTypes: string[];
  amountLimit?: number;
  status: 'active' | 'expired' | 'cancelled';
  reason: string;
}

const FinancialWorkflows = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Approval workflows loaded from the finance API
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const [workflowsError, setWorkflowsError] = useState<string | null>(null);

  const VALID_CATEGORIES: Workflow['category'][] = ['invoice', 'payment', 'expense', 'journal', 'budget', 'purchase', 'general'];

  const loadWorkflows = async () => {
    try {
      setWorkflowsLoading(true);
      setWorkflowsError(null);
      const data = await FinanceService.getApprovalWorkflows();
      const mapped: Workflow[] = (data || []).map((w: any) => {
        const docType = String(w.documentType ?? 'general').toLowerCase();
        const category = (VALID_CATEGORIES.includes(docType as Workflow['category'])
          ? docType
          : 'general') as Workflow['category'];
        const rawSteps = Array.isArray(w.steps) ? w.steps : [];
        const stages: WorkflowStage[] = rawSteps.map((s: any, i: number) => ({
          id: String(s?.id ?? `${w.id}-S${i + 1}`),
          sequence: Number(s?.sequence ?? i + 1),
          name: s?.name ?? s?.approverRole ?? s?.role ?? `Stage ${i + 1}`,
          type: (s?.type ?? 'approval') as WorkflowStage['type'],
          assignmentType: (s?.assignmentType ?? 'role') as WorkflowStage['assignmentType'],
          assignedTo: Array.isArray(s?.assignedTo)
            ? s.assignedTo
            : s?.approverRole
              ? [s.approverRole]
              : [],
          sla: Number(s?.sla ?? 24),
          escalationTo: s?.escalationTo,
          parallel: Boolean(s?.parallel ?? false),
        }));
        const isActive = w.isActive ?? String(w.status ?? '').toLowerCase() === 'active';
        return {
          id: String(w.id),
          name: w.name ?? 'Workflow',
          type: 'approval',
          category,
          status: isActive ? 'active' : 'inactive',
          priority: 'medium',
          createdBy: w.createdBy ?? '-',
          createdDate: w.createdAt ?? '-',
          modifiedDate: w.updatedAt ?? '-',
          description: w.description ?? '',
          triggers: [
            {
              id: `${w.id}-T`,
              type: 'amount',
              operator: 'between',
              value: [w.minAmount ?? 0, w.maxAmount ?? 0],
              description:
                w.minAmount != null || w.maxAmount != null
                  ? `Amount between ${w.minAmount ?? 0} and ${w.maxAmount ?? '∞'}`
                  : `When ${category} is submitted`,
            },
          ],
          stages,
          rules: [],
        };
      });
      setWorkflows(mapped);
    } catch (e: any) {
      setWorkflowsError(e?.message ?? 'Failed to load workflows');
      setWorkflows([]);
    } finally {
      setWorkflowsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const workflowInstances: WorkflowInstance[] = [
    {
      id: 'WI001',
      workflowId: 'WF001',
      documentId: 'INV-2024-001',
      documentType: 'Invoice',
      documentAmount: 25000,
      status: 'in-progress',
      currentStage: 2,
      initiatedBy: 'Jane Doe',
      initiatedDate: '2024-03-25 09:00',
      history: [
        { stage: 'Department Head Approval', action: 'approved', actionBy: 'Mike Johnson', actionDate: '2024-03-25 14:00', comments: 'Approved for processing', duration: 300 },
        { stage: 'Finance Review', action: 'returned', actionBy: 'Sarah Wilson', actionDate: '2024-03-26 10:00', comments: 'Missing PO number', duration: 1200 }
      ]
    },
    {
      id: 'WI002',
      workflowId: 'WF002',
      documentId: 'EXP-2024-045',
      documentType: 'Expense Report',
      documentAmount: 1500,
      status: 'approved',
      currentStage: 2,
      initiatedBy: 'Tom Brown',
      initiatedDate: '2024-03-24 10:00',
      completedDate: '2024-03-25 16:00',
      history: [
        { stage: 'Manager Approval', action: 'approved', actionBy: 'Lisa Chen', actionDate: '2024-03-24 15:00', comments: 'Within budget', duration: 300 },
        { stage: 'Finance Verification', action: 'approved', actionBy: 'David Lee', actionDate: '2024-03-25 16:00', comments: 'All receipts verified', duration: 1500 }
      ]
    },
    {
      id: 'WI003',
      workflowId: 'WF003',
      documentId: 'PAY-2024-089',
      documentType: 'Payment',
      documentAmount: 50000,
      status: 'pending',
      currentStage: 1,
      initiatedBy: 'Finance System',
      initiatedDate: '2024-03-26 08:00',
      history: []
    }
  ];

  const approvers: Approver[] = [
    { id: 'A001', name: 'John Smith', role: 'CFO', type: 'primary', level: 3, limitAmount: 1000000 },
    { id: 'A002', name: 'Sarah Wilson', role: 'Controller', type: 'primary', level: 2, limitAmount: 500000 },
    { id: 'A003', name: 'Mike Johnson', role: 'Finance Manager', type: 'primary', level: 1, limitAmount: 100000 },
    { id: 'A004', name: 'Lisa Chen', role: 'Department Head', type: 'primary', level: 1, limitAmount: 50000 },
    { id: 'A005', name: 'David Lee', role: 'Senior Accountant', type: 'alternate', level: 1, limitAmount: 25000 }
  ];

  const delegationRules: DelegationRule[] = [
    {
      id: 'D001',
      fromUser: 'John Smith',
      toUser: 'Sarah Wilson',
      startDate: '2024-03-25',
      endDate: '2024-03-30',
      workflowTypes: ['invoice', 'payment'],
      amountLimit: 100000,
      status: 'active',
      reason: 'Out of office - Business trip'
    },
    {
      id: 'D002',
      fromUser: 'Mike Johnson',
      toUser: 'David Lee',
      startDate: '2024-03-20',
      endDate: '2024-03-24',
      workflowTypes: ['expense'],
      status: 'expired',
      reason: 'Vacation'
    }
  ];

  // Analytics data
  const workflowMetrics = [
    { metric: 'Active Workflows', value: 12, change: 2, trend: 'up' },
    { metric: 'Pending Approvals', value: 24, change: -5, trend: 'down' },
    { metric: 'Avg Processing Time', value: '18h', change: -2, trend: 'down' },
    { metric: 'SLA Compliance', value: '94%', change: 3, trend: 'up' }
  ];

  const approvalTrend = [
    { day: 'Mon', approved: 12, rejected: 2, pending: 5 },
    { day: 'Tue', approved: 15, rejected: 1, pending: 8 },
    { day: 'Wed', approved: 18, rejected: 3, pending: 6 },
    { day: 'Thu', approved: 14, rejected: 2, pending: 10 },
    { day: 'Fri', approved: 20, rejected: 1, pending: 4 },
    { day: 'Sat', approved: 8, rejected: 0, pending: 2 },
    { day: 'Sun', approved: 5, rejected: 0, pending: 1 }
  ];

  const categoryDistribution = [
    { category: 'Invoice', count: 45, percentage: 35 },
    { category: 'Payment', count: 30, percentage: 23 },
    { category: 'Expense', count: 25, percentage: 20 },
    { category: 'Journal', count: 15, percentage: 12 },
    { category: 'Budget', count: 10, percentage: 8 },
    { category: 'Other', count: 3, percentage: 2 }
  ];

  const bottleneckAnalysis = [
    { stage: 'CFO Approval', avgTime: 72, sla: 48, instances: 12 },
    { stage: 'Finance Review', avgTime: 36, sla: 24, instances: 18 },
    { stage: 'Manager Approval', avgTime: 18, sla: 24, instances: 25 },
    { stage: 'Treasury Review', avgTime: 12, sla: 12, instances: 8 }
  ];

  const renderDashboardTab = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {workflowMetrics.map((metric, index) => (
          <div key={index} className={`rounded-lg p-3 ${
            index === 0 ? 'bg-blue-50' :
            index === 1 ? 'bg-yellow-50' :
            index === 2 ? 'bg-purple-50' :
            'bg-green-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{metric.metric}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center mt-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metric.change)} {typeof metric.change === 'number' ? (metric.change > 0 ? '↑' : '↓') : ''}
                  </span>
                </div>
              </div>
              <div className={`h-8 w-8 ${
                index === 0 ? 'text-blue-500' :
                index === 1 ? 'text-yellow-600' :
                index === 2 ? 'text-purple-500' :
                'text-green-500'
              }`}>
                {index === 0 ? <Activity /> :
                 index === 1 ? <Clock /> :
                 index === 2 ? <TrendingUp /> :
                 <CheckCircle />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Approval Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={approvalTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="approved" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              <Area type="monotone" dataKey="rejected" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Workflow Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'][index % 6]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Active Workflow Instances</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Document</th>
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-left py-2">Current Stage</th>
                <th className="text-center py-2">Status</th>
                <th className="text-left py-2">Initiated</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflowInstances.map(instance => {
                const workflow = workflows.find(w => w.id === instance.workflowId);
                const currentStage = workflow?.stages[instance.currentStage - 1];
                return (
                  <tr key={instance.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{instance.documentId}</td>
                    <td className="py-2">{instance.documentType}</td>
                    <td className="text-right py-2">
                      {instance.documentAmount ? `$${new Intl.NumberFormat('en-US').format(instance.documentAmount)}` : '-'}
                    </td>
                    <td className="py-2">{currentStage?.name || '-'}</td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        instance.status === 'approved' ? 'bg-green-100 text-green-800' :
                        instance.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        instance.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        instance.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {instance.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-2 text-sm">
                      <div>{instance.initiatedBy}</div>
                      <div className="text-xs text-gray-500">{instance.initiatedDate}</div>
                    </td>
                    <td className="text-center py-2">
                      <button
                        onClick={() => setSelectedInstance(instance)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Bottleneck Analysis</h3>
          <div className="space-y-3">
            {bottleneckAnalysis.map(item => (
              <div key={item.stage} className="p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.stage}</span>
                  <span className="text-xs text-gray-500">{item.instances} instances</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Avg Time: {item.avgTime}h</span>
                      <span>SLA: {item.sla}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.avgTime <= item.sla ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((item.avgTime / item.sla) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  {item.avgTime > item.sla && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Active Delegations</h3>
          <div className="space-y-3">
            {delegationRules.filter(d => d.status === 'active').map(delegation => (
              <div key={delegation.id} className="p-3 bg-blue-50 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{delegation.fromUser} → {delegation.toUser}</p>
                    <p className="text-xs text-gray-600 mt-1">{delegation.reason}</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs">
                      <span className="text-gray-500">
                        {delegation.startDate} - {delegation.endDate}
                      </span>
                      {delegation.amountLimit && (
                        <span className="text-gray-500">
                          Limit: ${new Intl.NumberFormat('en-US').format(delegation.amountLimit)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Remove</span>
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowDelegationModal(true)}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Delegation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkflowsTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Workflow Configurations</h3>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            <button
              onClick={() => setShowWorkflowBuilder(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </button>
          </div>
        </div>

        {workflowsLoading && <p className="text-sm text-gray-500 mb-2">Loading workflows…</p>}
        {workflowsError && <p className="text-sm text-red-600 mb-2">{workflowsError}</p>}
        {!workflowsLoading && workflows.length === 0 && (
          <p className="text-sm text-gray-500 mb-2">No workflows found.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {workflows
            .filter(w => filterStatus === 'all' || w.status === filterStatus)
            .map(workflow => (
              <div key={workflow.id} className="border rounded-lg p-3 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{workflow.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{workflow.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                    workflow.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    workflow.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {workflow.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-xs">
                    <GitBranch className="h-3 w-3 mr-2 text-gray-400" />
                    <span>{workflow.stages.length} stages</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Shield className="h-3 w-3 mr-2 text-gray-400" />
                    <span className="capitalize">{workflow.priority} priority</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Clock className="h-3 w-3 mr-2 text-gray-400" />
                    <span>Modified {workflow.modifiedDate}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <button
                    onClick={() => setSelectedWorkflow(workflow)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Details
                  </button>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Settings</span>
                    </button>
                    {workflow.status === 'active' ? (
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-yellow-300 rounded-lg hover:bg-yellow-50 text-sm">
                        <Pause className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-600">Pause</span>
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm">
                        <Play className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Start</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {selectedWorkflow && (
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{selectedWorkflow.name} - Workflow Details</h3>
            <button onClick={() => setSelectedWorkflow(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-3">
            <h4 className="font-medium mb-3">Workflow Stages</h4>
            <div className="relative">
              {selectedWorkflow.stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    {stage.sequence}
                  </div>
                  <div className="flex-1 ml-4 p-3 bg-gray-50 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{stage.name}</p>
                        <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                          <span className="capitalize">Type: {stage.type}</span>
                          <span>Assignment: {stage.assignmentType}</span>
                          <span>SLA: {stage.sla}h</span>
                          {stage.parallel && <span className="text-blue-600">Parallel</span>}
                        </div>
                        <div className="mt-1">
                          <span className="text-xs text-gray-600">Assigned to: </span>
                          {stage.assignedTo.map((assignee, i) => (
                            <span key={i} className="text-xs bg-white px-2 py-1 rounded mr-1">
                              {assignee}
                            </span>
                          ))}
                        </div>
                      </div>
                      {stage.escalationTo && (
                        <div className="text-xs text-orange-600">
                          Escalates to: {stage.escalationTo}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < selectedWorkflow.stages.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Triggers</h4>
            <div className="space-y-2">
              {selectedWorkflow.triggers.map(trigger => (
                <div key={trigger.id} className="p-3 bg-yellow-50 rounded">
                  <p className="text-sm">{trigger.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Type: {trigger.type} | Operator: {trigger.operator} | Value: {
                      Array.isArray(trigger.value) ? trigger.value.join(' - ') : trigger.value
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderApprovalMatrixTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Approval Matrix</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Approver
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Level</th>
                <th className="text-left py-2">Approver</th>
                <th className="text-left py-2">Role</th>
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Approval Limit</th>
                <th className="text-center py-2">Categories</th>
                <th className="text-center py-2">Status</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvers.map(approver => (
                <tr key={approver.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {approver.level}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm mr-2">
                        {approver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {approver.name}
                    </div>
                  </td>
                  <td className="py-2">{approver.role}</td>
                  <td className="py-2">
                    <span className="capitalize">{approver.type}</span>
                  </td>
                  <td className="text-right py-2 font-semibold">
                    ${new Intl.NumberFormat('en-US').format(approver.limitAmount || 0)}
                  </td>
                  <td className="text-center py-2">
                    <div className="flex justify-center space-x-1">
                      {['invoice', 'payment', 'expense'].map(cat => (
                        <span key={cat} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="text-center py-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm mr-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Settings</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                      <X className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Approval Hierarchy</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(level => {
              const levelApprovers = approvers.filter(a => a.level === level);
              return (
                <div key={level} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Level {level}</span>
                    <span className="text-sm text-gray-500">{levelApprovers.length} approvers</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {levelApprovers.map(approver => (
                      <span key={approver.id} className="px-3 py-1 bg-white rounded text-sm">
                        {approver.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Approval Rules</h3>
          <div className="space-y-3">
            {[
              { range: '$0 - $10,000', approvers: 'Level 1', color: 'green' },
              { range: '$10,001 - $50,000', approvers: 'Level 1 + 2', color: 'yellow' },
              { range: '$50,001 - $100,000', approvers: 'Level 2 + 3', color: 'orange' },
              { range: '$100,001+', approvers: 'Level 3 + Board', color: 'red' }
            ].map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    rule.color === 'green' ? 'bg-green-500' :
                    rule.color === 'yellow' ? 'bg-yellow-500' :
                    rule.color === 'orange' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`} />
                  <span className="font-medium text-sm">{rule.range}</span>
                </div>
                <span className="text-sm text-gray-600">{rule.approvers}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">SLA Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={[
              { name: 'On Time', value: 94, fill: '#10B981' },
              { name: 'Delayed', value: 6, fill: '#EF4444' }
            ]}>
              <RadialBar dataKey="value" />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold">
                94%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>On Time</span>
              <span className="font-semibold text-green-600">142 instances</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delayed</span>
              <span className="font-semibold text-red-600">9 instances</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Processing Time by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { category: 'Invoice', time: 18 },
              { category: 'Payment', time: 24 },
              { category: 'Expense', time: 12 },
              { category: 'Journal', time: 36 },
              { category: 'Budget', time: 48 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} hours`} />
              <Bar dataKey="time" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">User Activity</h3>
          <div className="space-y-3">
            {[
              { user: 'John Smith', actions: 45, pending: 3 },
              { user: 'Sarah Wilson', actions: 38, pending: 5 },
              { user: 'Mike Johnson', actions: 32, pending: 2 },
              { user: 'Lisa Chen', actions: 28, pending: 4 },
              { user: 'David Lee', actions: 25, pending: 1 }
            ].map(user => (
              <div key={user.user} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs mr-2">
                    {user.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm">{user.user}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{user.actions} actions</span>
                  {user.pending > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      {user.pending} pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Workflow Audit Trail</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Timestamp</th>
                <th className="text-left py-2">Document</th>
                <th className="text-left py-2">Action</th>
                <th className="text-left py-2">User</th>
                <th className="text-left py-2">Stage</th>
                <th className="text-left py-2">Comments</th>
                <th className="text-center py-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {workflowInstances.flatMap(instance =>
                instance.history.map((history, index) => (
                  <tr key={`${instance.id}-${index}`} className="border-b hover:bg-gray-50">
                    <td className="py-2">{history.actionDate}</td>
                    <td className="py-2 font-mono">{instance.documentId}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${
                        history.action === 'approved' ? 'bg-green-100 text-green-800' :
                        history.action === 'rejected' ? 'bg-red-100 text-red-800' :
                        history.action === 'returned' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {history.action}
                      </span>
                    </td>
                    <td className="py-2">{history.actionBy}</td>
                    <td className="py-2">{history.stage}</td>
                    <td className="py-2">{history.comments || '-'}</td>
                    <td className="text-center py-2">{Math.floor(history.duration / 60)}h {history.duration % 60}m</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Exception Report</h3>
          <div className="space-y-3">
            {[
              { type: 'SLA Breach', count: 5, severity: 'high' },
              { type: 'Escalations', count: 8, severity: 'medium' },
              { type: 'Rejections', count: 3, severity: 'low' },
              { type: 'System Errors', count: 1, severity: 'critical' }
            ].map(exception => (
              <div key={exception.type} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <AlertCircle className={`h-5 w-5 mr-3 ${
                    exception.severity === 'critical' ? 'text-red-600' :
                    exception.severity === 'high' ? 'text-orange-600' :
                    exception.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <span className="font-medium">{exception.type}</span>
                </div>
                <span className="font-semibold">{exception.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Upcoming Expirations</h3>
          <div className="space-y-3">
            {[
              { item: 'John Smith Delegation', type: 'delegation', expires: '2 days' },
              { item: 'Q1 Budget Approval', type: 'workflow', expires: '5 days' },
              { item: 'Invoice WF-001 SLA', type: 'sla', expires: '6 hours' },
              { item: 'Payment Authorization', type: 'approval', expires: '12 hours' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{item.item}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                </div>
                <span className={`text-sm font-semibold ${
                  item.expires.includes('hour') ? 'text-red-600' :
                  item.expires.includes('2 days') ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  {item.expires}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Workflows</h2>
        <p className="text-gray-600">Configure and manage approval workflows with advanced routing and delegation</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-3">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['dashboard', 'workflows', 'approval-matrix', 'monitoring'].map((tab) => (
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
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'workflows' && renderWorkflowsTab()}
        {activeTab === 'approval-matrix' && renderApprovalMatrixTab()}
        {activeTab === 'monitoring' && renderMonitoringTab()}
      </div>

      {selectedInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Workflow Instance Details - {selectedInstance.documentId}</h3>
              <button onClick={() => setSelectedInstance(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <p className="text-sm text-gray-600">Document Type</p>
                <p className="font-semibold">{selectedInstance.documentType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold">
                  {selectedInstance.documentAmount ? `$${new Intl.NumberFormat('en-US').format(selectedInstance.documentAmount)}` : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs capitalize ${
                  selectedInstance.status === 'approved' ? 'bg-green-100 text-green-800' :
                  selectedInstance.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  selectedInstance.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedInstance.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Workflow History</h4>
              <div className="space-y-3">
                {selectedInstance.history.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.action === 'approved' ? 'bg-green-100 text-green-600' :
                      item.action === 'rejected' ? 'bg-red-100 text-red-600' :
                      item.action === 'returned' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {item.action === 'approved' ? <CheckCircle className="h-5 w-5" /> :
                       item.action === 'rejected' ? <XCircle className="h-5 w-5" /> :
                       item.action === 'returned' ? <RotateCcw className="h-5 w-5" /> :
                       <Clock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 ml-3">
                      <div className="bg-gray-50 rounded p-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium">{item.stage}</p>
                          <span className="text-xs text-gray-500">{item.actionDate}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="capitalize">{item.action}</span> by {item.actionBy}
                        </p>
                        {item.comments && (
                          <p className="text-sm text-gray-500 mt-1">"{item.comments}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Processing time: {Math.floor(item.duration / 60)}h {item.duration % 60}m
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setSelectedInstance(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelegationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Create Delegation Rule</h3>
              <button onClick={() => setShowDelegationModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">From User</label>
                <select className="w-full border rounded px-3 py-2">
                  {approvers.map(approver => (
                    <option key={approver.id} value={approver.id}>
                      {approver.name} - {approver.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To User</label>
                <select className="w-full border rounded px-3 py-2">
                  {approvers.map(approver => (
                    <option key={approver.id} value={approver.id}>
                      {approver.name} - {approver.role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Workflow Types</label>
                <div className="space-y-2">
                  {['invoice', 'payment', 'expense', 'journal', 'budget'].map(type => (
                    <label key={type} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount Limit (Optional)</label>
                <input type="number" className="w-full border rounded px-3 py-2" placeholder="No limit" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowDelegationModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Create Delegation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWorkflowBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full  max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Workflow Builder</h3>
              <button onClick={() => setShowWorkflowBuilder(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
              <GitBranch className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">Visual workflow builder would be implemented here</p>
              <p className="text-sm text-gray-500 mt-2">Drag and drop stages, configure rules, and set up routing</p>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowWorkflowBuilder(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialWorkflows;