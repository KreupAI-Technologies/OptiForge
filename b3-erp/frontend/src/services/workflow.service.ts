import { apiClient } from './api/client';
import { USE_LIVE_API } from './api-flags';

const USE_MOCK_DATA = !USE_LIVE_API;

// ============================================================================
// Types & Interfaces
// ============================================================================

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum InstanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
  FAILED = 'failed',
}

export enum StepType {
  APPROVAL = 'approval',
  TASK = 'task',
  NOTIFICATION = 'notification',
  CONDITION = 'condition',
  PARALLEL = 'parallel',
  SUBPROCESS = 'subprocess',
}

export interface WorkflowStepAssignee {
  type?: string;
  id: string;
  name?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  description?: string;
  order?: number;
  assigneeType: 'user' | 'role' | 'department' | 'dynamic';
  assigneeId?: string;
  assigneeName?: string;
  assignees?: WorkflowStepAssignee[];
  dueInDays?: number;
  escalationDays?: number;
  escalateTo?: string;
  actions: string[];
  nextSteps: {
    action: string;
    targetStepId: string;
  }[];
  conditions?: {
    field: string;
    operator: string;
    value: any;
  }[];
  metadata?: Record<string, any>;
}

export interface WorkflowTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  version: number;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  triggerType: 'manual' | 'automatic' | 'scheduled';
  triggerConditions?: Record<string, any>;
  entityType?: string;
  notificationSettings?: {
    onStart: boolean;
    onComplete: boolean;
    onStepComplete: boolean;
    reminderDays?: number[];
  };
  slaSettings?: {
    warningDays: number;
    criticalDays: number;
    maxDays: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  instanceCount: number;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  templateName: string;
  templateCode: string;
  entityType: string;
  entityId: string;
  entityName: string;
  status: InstanceStatus;
  currentStepId: string;
  currentStepName: string;
  initiatedBy: string;
  initiatorName: string;
  startedAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  stepHistory: {
    stepId: string;
    stepName: string;
    action: string;
    performedBy: string;
    performedByName: string;
    performedAt: Date;
    comments?: string;
  }[];
  metadata?: Record<string, any>;
}

export interface CreateWorkflowStepDto {
  id?: string;
  name: string;
  type: StepType | string;
  description?: string;
  order?: number;
  assigneeType?: 'user' | 'role' | 'department' | 'dynamic' | 'position' | string;
  assigneeId?: string;
  assigneeName?: string;
  assignees?: Array<{ type?: string; id: string; name?: string }>;
  dueInDays?: number;
  escalationDays?: number;
  escalateTo?: string;
  actions?: string[];
  nextSteps?: {
    action: string;
    targetStepId: string;
  }[];
  conditions?: any;
  metadata?: Record<string, any>;
}

export interface CreateTemplateDto {
  code?: string;
  name: string;
  description?: string;
  category?: string;
  status?: WorkflowStatus;
  steps?: Array<CreateWorkflowStepDto | Record<string, any>>;
  triggerType?: 'manual' | 'automatic' | 'scheduled';
  triggerConditions?: Record<string, any>;
  entityType?: string;
  notificationSettings?: WorkflowTemplate['notificationSettings'];
  slaSettings?: Partial<WorkflowTemplate['slaSettings']>;
}

export interface InstanceFilters {
  status?: InstanceStatus;
  templateId?: string;
  entityType?: string;
  initiatedBy?: string;
  priority?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface WorkflowStatistics {
  totalTemplates: number;
  activeTemplates: number;
  totalInstances: number;
  pendingInstances: number;
  completedInstances: number;
  instancesByStatus: Record<string, number>;
  avgCompletionDays: number;
}

// ---------------------------------------------------------------------------
// Order Tracking detail (live) — matches the OrderTracking ORM entity shape
// Backend controller: @Controller('api/workflow/order-tracking') @Get(':orderId')
// ---------------------------------------------------------------------------

export interface OrderTrackingEventInfo {
  status: string;
  timestamp: string;
  description: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface OrderTrackingWorkOrderInfo {
  workOrderId?: string;
  workOrderNumber: string;
  itemName: string;
  quantity: number;
  status: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
}

export interface OrderTrackingDetail {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  completedDate?: string;
  events: OrderTrackingEventInfo[];
  workOrders: OrderTrackingWorkOrderInfo[];
  shipments?: any[];
  invoices?: any[];
  payments?: any[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_WORKFLOW_STEPS: Record<string, WorkflowStep[]> = {
  'purchase-approval': [
    {
      id: 'step-1',
      name: 'Submit Request',
      type: StepType.TASK,
      description: 'Submit purchase request with required details',
      assigneeType: 'dynamic',
      actions: ['submit'],
      nextSteps: [{ action: 'submit', targetStepId: 'step-2' }],
    },
    {
      id: 'step-2',
      name: 'Manager Approval',
      type: StepType.APPROVAL,
      description: 'Department manager reviews and approves',
      assigneeType: 'role',
      assigneeId: 'role-003',
      assigneeName: 'Department Manager',
      dueInDays: 2,
      escalationDays: 3,
      escalateTo: 'role-002',
      actions: ['approve', 'reject', 'request_info'],
      nextSteps: [
        { action: 'approve', targetStepId: 'step-3' },
        { action: 'reject', targetStepId: 'step-end' },
        { action: 'request_info', targetStepId: 'step-1' },
      ],
    },
    {
      id: 'step-3',
      name: 'Finance Review',
      type: StepType.APPROVAL,
      description: 'Finance team reviews budget availability',
      assigneeType: 'department',
      assigneeId: 'dept-finance',
      assigneeName: 'Finance Department',
      dueInDays: 3,
      actions: ['approve', 'reject'],
      nextSteps: [
        { action: 'approve', targetStepId: 'step-4' },
        { action: 'reject', targetStepId: 'step-end' },
      ],
      conditions: [{ field: 'amount', operator: 'gte', value: 10000 }],
    },
    {
      id: 'step-4',
      name: 'Final Approval',
      type: StepType.APPROVAL,
      description: 'Executive approval for high-value purchases',
      assigneeType: 'role',
      assigneeId: 'role-001',
      assigneeName: 'Executive',
      dueInDays: 2,
      actions: ['approve', 'reject'],
      nextSteps: [
        { action: 'approve', targetStepId: 'step-end' },
        { action: 'reject', targetStepId: 'step-end' },
      ],
      conditions: [{ field: 'amount', operator: 'gte', value: 50000 }],
    },
    {
      id: 'step-end',
      name: 'Complete',
      type: StepType.NOTIFICATION,
      description: 'Workflow completed',
      assigneeType: 'dynamic',
      actions: [],
      nextSteps: [],
    },
  ],
  'leave-request': [
    {
      id: 'step-1',
      name: 'Submit Leave Request',
      type: StepType.TASK,
      assigneeType: 'dynamic',
      actions: ['submit'],
      nextSteps: [{ action: 'submit', targetStepId: 'step-2' }],
    },
    {
      id: 'step-2',
      name: 'Manager Approval',
      type: StepType.APPROVAL,
      assigneeType: 'role',
      assigneeId: 'role-003',
      assigneeName: 'Direct Manager',
      dueInDays: 1,
      actions: ['approve', 'reject'],
      nextSteps: [
        { action: 'approve', targetStepId: 'step-3' },
        { action: 'reject', targetStepId: 'step-end' },
      ],
    },
    {
      id: 'step-3',
      name: 'HR Notification',
      type: StepType.NOTIFICATION,
      assigneeType: 'department',
      assigneeId: 'dept-hr',
      actions: [],
      nextSteps: [{ action: 'auto', targetStepId: 'step-end' }],
    },
    {
      id: 'step-end',
      name: 'Complete',
      type: StepType.NOTIFICATION,
      assigneeType: 'dynamic',
      actions: [],
      nextSteps: [],
    },
  ],
};

export const MOCK_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'template-001',
    code: 'PURCHASE_APPROVAL',
    name: 'Purchase Order Approval',
    description: 'Multi-level approval workflow for purchase orders based on amount thresholds',
    category: 'Procurement',
    version: 3,
    status: WorkflowStatus.ACTIVE,
    steps: MOCK_WORKFLOW_STEPS['purchase-approval'],
    triggerType: 'automatic',
    triggerConditions: { entityType: 'purchase_order', event: 'created' },
    entityType: 'purchase_order',
    notificationSettings: {
      onStart: true,
      onComplete: true,
      onStepComplete: true,
      reminderDays: [1, 3],
    },
    slaSettings: {
      warningDays: 3,
      criticalDays: 5,
      maxDays: 7,
    },
    createdAt: new Date('2024-03-01T10:00:00Z'),
    updatedAt: new Date('2025-11-15T14:30:00Z'),
    createdBy: 'user-001',
    instanceCount: 245,
  },
  {
    id: 'template-002',
    code: 'LEAVE_REQUEST',
    name: 'Leave Request Approval',
    description: 'Employee leave request approval workflow',
    category: 'HR',
    version: 2,
    status: WorkflowStatus.ACTIVE,
    steps: MOCK_WORKFLOW_STEPS['leave-request'],
    triggerType: 'manual',
    entityType: 'leave_request',
    notificationSettings: {
      onStart: true,
      onComplete: true,
      onStepComplete: false,
    },
    slaSettings: {
      warningDays: 1,
      criticalDays: 2,
      maxDays: 3,
    },
    createdAt: new Date('2024-02-15T09:00:00Z'),
    updatedAt: new Date('2025-08-20T11:00:00Z'),
    createdBy: 'user-002',
    instanceCount: 892,
  },
  {
    id: 'template-003',
    code: 'EXPENSE_CLAIM',
    name: 'Expense Claim Approval',
    description: 'Employee expense reimbursement approval workflow',
    category: 'Finance',
    version: 1,
    status: WorkflowStatus.ACTIVE,
    steps: [],
    triggerType: 'manual',
    entityType: 'expense_claim',
    notificationSettings: {
      onStart: true,
      onComplete: true,
      onStepComplete: true,
    },
    slaSettings: {
      warningDays: 5,
      criticalDays: 7,
      maxDays: 10,
    },
    createdAt: new Date('2024-04-10T08:00:00Z'),
    updatedAt: new Date('2024-04-10T08:00:00Z'),
    createdBy: 'user-005',
    instanceCount: 567,
  },
  {
    id: 'template-004',
    code: 'SALES_ORDER',
    name: 'Sales Order Approval',
    description: 'Sales order approval with discount and credit limit checks',
    category: 'Sales',
    version: 2,
    status: WorkflowStatus.ACTIVE,
    steps: [],
    triggerType: 'automatic',
    triggerConditions: { entityType: 'sales_order', discountPercent: { gte: 10 } },
    entityType: 'sales_order',
    notificationSettings: {
      onStart: true,
      onComplete: true,
      onStepComplete: false,
    },
    slaSettings: {
      warningDays: 1,
      criticalDays: 2,
      maxDays: 3,
    },
    createdAt: new Date('2024-05-01T10:00:00Z'),
    updatedAt: new Date('2025-10-05T15:00:00Z'),
    createdBy: 'user-004',
    instanceCount: 423,
  },
  {
    id: 'template-005',
    code: 'WARRANTY_CLAIM',
    name: 'Warranty Claim Processing',
    description: 'Warranty claim verification and approval workflow',
    category: 'After Sales',
    version: 1,
    status: WorkflowStatus.ACTIVE,
    steps: [],
    triggerType: 'automatic',
    triggerConditions: { entityType: 'warranty_claim', event: 'created' },
    entityType: 'warranty_claim',
    notificationSettings: {
      onStart: true,
      onComplete: true,
      onStepComplete: true,
    },
    slaSettings: {
      warningDays: 3,
      criticalDays: 5,
      maxDays: 7,
    },
    createdAt: new Date('2024-06-15T11:00:00Z'),
    updatedAt: new Date('2024-06-15T11:00:00Z'),
    createdBy: 'user-006',
    instanceCount: 156,
  },
  {
    id: 'template-006',
    code: 'NEW_EMPLOYEE',
    name: 'New Employee Onboarding',
    description: 'Onboarding workflow for new employee setup',
    category: 'HR',
    version: 4,
    status: WorkflowStatus.ACTIVE,
    steps: [],
    triggerType: 'automatic',
    triggerConditions: { entityType: 'employee', event: 'hired' },
    entityType: 'employee',
    notificationSettings: {
      onStart: true,
      onComplete: true,
      onStepComplete: true,
      reminderDays: [1, 3, 7],
    },
    slaSettings: {
      warningDays: 7,
      criticalDays: 14,
      maxDays: 21,
    },
    createdAt: new Date('2024-01-20T09:00:00Z'),
    updatedAt: new Date('2025-12-01T10:00:00Z'),
    createdBy: 'user-002',
    instanceCount: 78,
  },
  {
    id: 'template-007',
    code: 'CONTRACT_REVIEW',
    name: 'Contract Review & Approval',
    description: 'Legal and management review for contracts',
    category: 'Legal',
    version: 1,
    status: WorkflowStatus.DRAFT,
    steps: [],
    triggerType: 'manual',
    entityType: 'contract',
    notificationSettings: {
      onStart: true,
      onComplete: true,
      onStepComplete: true,
    },
    slaSettings: {
      warningDays: 5,
      criticalDays: 10,
      maxDays: 14,
    },
    createdAt: new Date('2026-01-10T14:00:00Z'),
    updatedAt: new Date('2026-01-10T14:00:00Z'),
    createdBy: 'user-001',
    instanceCount: 0,
  },
];

export const MOCK_WORKFLOW_INSTANCES: WorkflowInstance[] = [
  {
    id: 'instance-001',
    templateId: 'template-001',
    templateName: 'Purchase Order Approval',
    templateCode: 'PURCHASE_APPROVAL',
    entityType: 'purchase_order',
    entityId: 'PO-2026-0125',
    entityName: 'Purchase Order #0125 - Office Supplies',
    status: InstanceStatus.IN_PROGRESS,
    currentStepId: 'step-3',
    currentStepName: 'Finance Review',
    initiatedBy: 'user-008',
    initiatorName: 'Amanda Brown',
    startedAt: new Date('2026-01-24T09:00:00Z'),
    dueDate: new Date('2026-01-31T17:00:00Z'),
    priority: 'medium',
    progress: 50,
    stepHistory: [
      {
        stepId: 'step-1',
        stepName: 'Submit Request',
        action: 'submit',
        performedBy: 'user-008',
        performedByName: 'Amanda Brown',
        performedAt: new Date('2026-01-24T09:00:00Z'),
      },
      {
        stepId: 'step-2',
        stepName: 'Manager Approval',
        action: 'approve',
        performedBy: 'user-003',
        performedByName: 'Michael Chen',
        performedAt: new Date('2026-01-24T14:30:00Z'),
        comments: 'Approved - within budget',
      },
    ],
    metadata: { amount: 25000, vendor: 'Office Depot', department: 'Procurement' },
  },
  {
    id: 'instance-002',
    templateId: 'template-002',
    templateName: 'Leave Request Approval',
    templateCode: 'LEAVE_REQUEST',
    entityType: 'leave_request',
    entityId: 'LR-2026-0089',
    entityName: 'Leave Request - Emily Davis',
    status: InstanceStatus.PENDING,
    currentStepId: 'step-2',
    currentStepName: 'Manager Approval',
    initiatedBy: 'user-004',
    initiatorName: 'Emily Davis',
    startedAt: new Date('2026-01-25T08:00:00Z'),
    dueDate: new Date('2026-01-26T17:00:00Z'),
    priority: 'high',
    progress: 25,
    stepHistory: [
      {
        stepId: 'step-1',
        stepName: 'Submit Leave Request',
        action: 'submit',
        performedBy: 'user-004',
        performedByName: 'Emily Davis',
        performedAt: new Date('2026-01-25T08:00:00Z'),
      },
    ],
    metadata: { leaveType: 'vacation', startDate: '2026-02-10', endDate: '2026-02-14', days: 5 },
  },
  {
    id: 'instance-003',
    templateId: 'template-003',
    templateName: 'Expense Claim Approval',
    templateCode: 'EXPENSE_CLAIM',
    entityType: 'expense_claim',
    entityId: 'EC-2026-0034',
    entityName: 'Expense Claim - Business Travel',
    status: InstanceStatus.COMPLETED,
    currentStepId: 'step-end',
    currentStepName: 'Complete',
    initiatedBy: 'user-004',
    initiatorName: 'Emily Davis',
    startedAt: new Date('2026-01-15T10:00:00Z'),
    completedAt: new Date('2026-01-20T16:00:00Z'),
    priority: 'low',
    progress: 100,
    stepHistory: [
      {
        stepId: 'step-1',
        stepName: 'Submit Claim',
        action: 'submit',
        performedBy: 'user-004',
        performedByName: 'Emily Davis',
        performedAt: new Date('2026-01-15T10:00:00Z'),
      },
      {
        stepId: 'step-2',
        stepName: 'Manager Review',
        action: 'approve',
        performedBy: 'user-010',
        performedByName: 'Lisa Anderson',
        performedAt: new Date('2026-01-17T11:00:00Z'),
      },
      {
        stepId: 'step-3',
        stepName: 'Finance Processing',
        action: 'approve',
        performedBy: 'user-005',
        performedByName: 'Robert Wilson',
        performedAt: new Date('2026-01-20T16:00:00Z'),
        comments: 'Reimbursement processed',
      },
    ],
    metadata: { amount: 1250, category: 'Travel', receipts: 5 },
  },
  {
    id: 'instance-004',
    templateId: 'template-001',
    templateName: 'Purchase Order Approval',
    templateCode: 'PURCHASE_APPROVAL',
    entityType: 'purchase_order',
    entityId: 'PO-2026-0118',
    entityName: 'Purchase Order #0118 - Manufacturing Equipment',
    status: InstanceStatus.ON_HOLD,
    currentStepId: 'step-2',
    currentStepName: 'Manager Approval',
    initiatedBy: 'user-003',
    initiatorName: 'Michael Chen',
    startedAt: new Date('2026-01-20T14:00:00Z'),
    dueDate: new Date('2026-01-27T17:00:00Z'),
    priority: 'critical',
    progress: 25,
    stepHistory: [
      {
        stepId: 'step-1',
        stepName: 'Submit Request',
        action: 'submit',
        performedBy: 'user-003',
        performedByName: 'Michael Chen',
        performedAt: new Date('2026-01-20T14:00:00Z'),
      },
      {
        stepId: 'step-2',
        stepName: 'Manager Approval',
        action: 'request_info',
        performedBy: 'user-001',
        performedByName: 'John Smith',
        performedAt: new Date('2026-01-22T10:00:00Z'),
        comments: 'Need updated vendor quote',
      },
    ],
    metadata: { amount: 85000, vendor: 'Industrial Machines Co', department: 'Production' },
  },
  {
    id: 'instance-005',
    templateId: 'template-005',
    templateName: 'Warranty Claim Processing',
    templateCode: 'WARRANTY_CLAIM',
    entityType: 'warranty_claim',
    entityId: 'WC-2026-0089',
    entityName: 'Warranty Claim #0089 - Defective Motor',
    status: InstanceStatus.CANCELLED,
    currentStepId: 'step-end',
    currentStepName: 'Complete',
    initiatedBy: 'system',
    initiatorName: 'System',
    startedAt: new Date('2026-01-18T09:00:00Z'),
    completedAt: new Date('2026-01-26T15:30:00Z'),
    priority: 'medium',
    progress: 100,
    stepHistory: [
      {
        stepId: 'step-1',
        stepName: 'Claim Submitted',
        action: 'submit',
        performedBy: 'system',
        performedByName: 'System',
        performedAt: new Date('2026-01-18T09:00:00Z'),
      },
      {
        stepId: 'step-2',
        stepName: 'Technical Review',
        action: 'reject',
        performedBy: 'user-006',
        performedByName: 'Jennifer Martinez',
        performedAt: new Date('2026-01-26T15:30:00Z'),
        comments: 'Product tampered - warranty void',
      },
    ],
    metadata: { productId: 'PROD-456', claimAmount: 2500, reason: 'Motor failure' },
  },
];

// ============================================================================
// Service Class
// ============================================================================

export class WorkflowService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await apiClient.request<T>({
      url: endpoint,
      method: options?.method || 'GET',
      data: options?.body ? JSON.parse(options.body as string) : undefined,
      headers: options?.headers as any,
    });

    return response.data;
  }

  // -------------------------------------------------------------------------
  // Template Methods
  // -------------------------------------------------------------------------

  /**
   * Get all workflow templates
   */
  static async getAllWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...MOCK_WORKFLOW_TEMPLATES];
    }

    return this.request<WorkflowTemplate[]>('/api/workflow/templates');
  }

  /**
   * Get a single workflow template by ID
   */
  static async getTemplateById(id: string): Promise<WorkflowTemplate> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const template = MOCK_WORKFLOW_TEMPLATES.find((t) => t.id === id);
      if (!template) {
        throw new Error('Workflow template not found');
      }
      return template;
    }

    return this.request<WorkflowTemplate>(`/api/workflow/templates/${id}`);
  }

  /**
   * Create a new workflow template
   */
  static async createTemplate(data: CreateTemplateDto): Promise<WorkflowTemplate> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const steps: WorkflowStep[] = (data.steps ?? []).map((step, index) => ({
        id: step.id || `step-${index + 1}`,
        name: step.name || `Step ${index + 1}`,
        type: (step.type as StepType) || StepType.APPROVAL,
        description: step.description,
        order: step.order ?? index + 1,
        assigneeType: step.assigneeType || 'role',
        assigneeId: step.assigneeId,
        assigneeName: step.assigneeName,
        assignees: step.assignees,
        dueInDays: step.dueInDays,
        escalationDays: step.escalationDays,
        escalateTo: step.escalateTo,
        actions: step.actions || ['approve', 'reject'],
        nextSteps: step.nextSteps || [],
        conditions: Array.isArray(step.conditions) ? step.conditions : [],
        metadata: step.metadata,
      } as WorkflowStep));

      const newTemplate: WorkflowTemplate = {
        id: `template-${Date.now()}`,
        code: data.code || `WF_${Date.now()}`,
        name: data.name,
        description: data.description || '',
        category: data.category || 'General',
        version: 1,
        status: data.status || WorkflowStatus.DRAFT,
        steps,
        triggerType: data.triggerType || 'manual',
        triggerConditions: data.triggerConditions,
        entityType: data.entityType,
        notificationSettings: data.notificationSettings,
        slaSettings: data.slaSettings as WorkflowTemplate['slaSettings'],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
        instanceCount: 0,
      };
      MOCK_WORKFLOW_TEMPLATES.push(newTemplate);
      return newTemplate;
    }

    return this.request<WorkflowTemplate>('/api/workflow/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a workflow template
   */
  static async updateTemplate(id: string, data: Partial<CreateTemplateDto>): Promise<WorkflowTemplate> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = MOCK_WORKFLOW_TEMPLATES.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Workflow template not found');
      }

      const updatedTemplate: WorkflowTemplate = {
        ...MOCK_WORKFLOW_TEMPLATES[index],
        ...data,
        version: MOCK_WORKFLOW_TEMPLATES[index].version + 1,
        updatedAt: new Date(),
      } as WorkflowTemplate;
      MOCK_WORKFLOW_TEMPLATES[index] = updatedTemplate;
      return updatedTemplate;
    }

    return this.request<WorkflowTemplate>(`/api/workflow/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a workflow template
   */
  static async deleteTemplate(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_WORKFLOW_TEMPLATES.findIndex((t) => t.id === id);
      if (index !== -1) MOCK_WORKFLOW_TEMPLATES.splice(index, 1);
      return;
    }

    await this.request<void>(`/api/workflow/templates/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Create a new workflow template (alias for createTemplate)
   */
  static async createWorkflowTemplate(data: Partial<CreateTemplateDto>): Promise<WorkflowTemplate> {
    return this.createTemplate(data as CreateTemplateDto);
  }

  /**
   * Import a workflow template from a parsed JSON definition.
   * Persists via the backend import endpoint (POST /api/workflow/templates/import),
   * which strips any incoming id/timestamps and creates a fresh record.
   */
  static async importTemplate(definition: Record<string, any>): Promise<WorkflowTemplate> {
    if (USE_MOCK_DATA) {
      return this.createTemplate(definition as CreateTemplateDto);
    }
    return this.request<WorkflowTemplate>('/api/workflow/templates/import', {
      method: 'POST',
      body: JSON.stringify(definition),
    });
  }

  /**
   * Update a workflow template (alias for updateTemplate)
   */
  static async updateWorkflowTemplate(id: string, data: Partial<CreateTemplateDto>): Promise<WorkflowTemplate> {
    return this.updateTemplate(id, data);
  }

  /**
   * Instantiate a workflow from a template
   */
  static async instantiateTemplate(
    id: string,
    entityData?: { entityId: string; entityName: string; metadata?: Record<string, any> }
  ): Promise<WorkflowInstance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const template = MOCK_WORKFLOW_TEMPLATES.find((t) => t.id === id);
      if (!template) {
        throw new Error('Workflow template not found');
      }

      const newInstance: WorkflowInstance = {
        id: `instance-${Date.now()}`,
        templateId: template.id,
        templateName: template.name,
        templateCode: template.code,
        entityType: template.entityType || 'unknown',
        entityId: entityData?.entityId || `entity-${Date.now()}`,
        entityName: entityData?.entityName || 'New Entity',
        status: InstanceStatus.PENDING,
        currentStepId: template.steps[0]?.id || 'step-1',
        currentStepName: template.steps[0]?.name || 'Initial Step',
        initiatedBy: 'current-user',
        initiatorName: 'Current User',
        startedAt: new Date(),
        priority: 'medium',
        progress: 0,
        stepHistory: [],
        metadata: entityData?.metadata,
      };

      MOCK_WORKFLOW_INSTANCES.push(newInstance);
      return newInstance;
    }

    return this.request<WorkflowInstance>(`/api/workflow/templates/${id}/instantiate`, {
      method: 'POST',
      body: JSON.stringify(entityData),
    });
  }

  // -------------------------------------------------------------------------
  // Instance Methods
  // -------------------------------------------------------------------------

  /**
   * Get all workflow instances with optional filters
   */
  static async getWorkflowInstances(filters?: InstanceFilters): Promise<WorkflowInstance[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      let filteredInstances = [...MOCK_WORKFLOW_INSTANCES];

      if (filters?.status) {
        filteredInstances = filteredInstances.filter((i) => i.status === filters.status);
      }
      if (filters?.templateId) {
        filteredInstances = filteredInstances.filter((i) => i.templateId === filters.templateId);
      }
      if (filters?.entityType) {
        filteredInstances = filteredInstances.filter((i) => i.entityType === filters.entityType);
      }
      if (filters?.initiatedBy) {
        filteredInstances = filteredInstances.filter((i) => i.initiatedBy === filters.initiatedBy);
      }
      if (filters?.priority) {
        filteredInstances = filteredInstances.filter((i) => i.priority === filters.priority);
      }
      if (filters?.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filteredInstances = filteredInstances.filter((i) => new Date(i.startedAt) >= fromDate);
      }
      if (filters?.toDate) {
        const toDate = new Date(filters.toDate);
        filteredInstances = filteredInstances.filter((i) => new Date(i.startedAt) <= toDate);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredInstances = filteredInstances.filter(
          (i) =>
            i.entityName.toLowerCase().includes(searchLower) ||
            i.templateName.toLowerCase().includes(searchLower) ||
            i.initiatorName.toLowerCase().includes(searchLower)
        );
      }

      return filteredInstances;
    }

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.templateId) queryParams.set('templateId', filters.templateId);
    if (filters?.entityType) queryParams.set('entityType', filters.entityType);
    if (filters?.initiatedBy) queryParams.set('initiatedBy', filters.initiatedBy);
    if (filters?.priority) queryParams.set('priority', filters.priority);
    if (filters?.fromDate) queryParams.set('fromDate', filters.fromDate);
    if (filters?.toDate) queryParams.set('toDate', filters.toDate);
    if (filters?.search) queryParams.set('search', filters.search);

    const queryString = queryParams.toString();
    return this.request<WorkflowInstance[]>(
      `/workflow-repository/instances${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get a single workflow instance by ID
   */
  static async getInstanceById(id: string): Promise<WorkflowInstance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const instance = MOCK_WORKFLOW_INSTANCES.find((i) => i.id === id);
      if (!instance) {
        throw new Error('Workflow instance not found');
      }
      return instance;
    }

    return this.request<WorkflowInstance>(`/workflow-repository/instances/${id}`);
  }

  /**
   * Get workflow statistics
   */
  static async getWorkflowStatistics(): Promise<WorkflowStatistics> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const instancesByStatus: Record<string, number> = {};
      MOCK_WORKFLOW_INSTANCES.forEach((instance) => {
        instancesByStatus[instance.status] = (instancesByStatus[instance.status] || 0) + 1;
      });

      return {
        totalTemplates: MOCK_WORKFLOW_TEMPLATES.length,
        activeTemplates: MOCK_WORKFLOW_TEMPLATES.filter((t) => t.status === WorkflowStatus.ACTIVE).length,
        totalInstances: MOCK_WORKFLOW_INSTANCES.length,
        pendingInstances: instancesByStatus[InstanceStatus.PENDING] || 0,
        completedInstances: instancesByStatus[InstanceStatus.COMPLETED] || 0,
        instancesByStatus,
        avgCompletionDays: 3.5,
      };
    }

    return this.request<WorkflowStatistics>('/api/workflow/statistics');
  }

  // -------------------------------------------------------------------------
  // Order Tracking (live) — GET /api/workflow/order-tracking
  // -------------------------------------------------------------------------

  /**
   * Get order-tracking rows (raw ORM shape). Optionally filter by status.
   * Backend controller: @Controller('api/workflow/order-tracking') @Get()
   */
  static async getOrderTracking(status?: string): Promise<any[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const data = await this.request<any>(`/api/workflow/order-tracking${query}`);
    return Array.isArray(data) ? data : [];
  }

  // -------------------------------------------------------------------------
  // Task Inbox (live) — GET /api/workflow/tasks/inbox/:userId
  // -------------------------------------------------------------------------

  /**
   * Get a user's task inbox (raw ORM shape). Backend wraps rows in
   * { success, data }, so this unwraps to the array.
   * Backend controller: @Controller('api/workflow/tasks') @Get('inbox/:userId')
   */
  static async getTaskInbox(userId: string): Promise<any[]> {
    const res = await this.request<any>(
      `/api/workflow/tasks/inbox/${encodeURIComponent(userId)}`
    );
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  /**
   * Get a user's task counts.
   * Backend controller: @Controller('api/workflow/tasks') @Get('counts/:userId')
   */
  static async getTaskCounts(userId: string): Promise<Record<string, number>> {
    const res = await this.request<any>(
      `/api/workflow/tasks/counts/${encodeURIComponent(userId)}`
    );
    const raw = res && res.data ? res.data : res;
    return (raw as Record<string, number>) ?? {};
  }

  // -------------------------------------------------------------------------
  // Order Tracking detail (live) — GET /api/workflow/order-tracking/:orderId
  // -------------------------------------------------------------------------

  /**
   * Get a single order-tracking record by its orderId (the [id] route param).
   * The backend controller returns the OrderTracking entity directly (not
   * wrapped in { success, data }), so this fetches raw and returns the object.
   * Backend controller: @Controller('api/workflow/order-tracking') @Get(':orderId')
   */
  static async getOrderTrackingById(orderId: string): Promise<OrderTrackingDetail> {
    const base =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const response = await fetch(
      `${base}/api/workflow/order-tracking/${encodeURIComponent(orderId)}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!response.ok) {
      let message = response.statusText || `HTTP ${response.status}`;
      try {
        const body = await response.json();
        if (body?.message) {
          message = Array.isArray(body.message) ? body.message.join('; ') : body.message;
        }
      } catch {
        // keep fallback
      }
      throw new Error(message);
    }
    const body = await response.json();
    // Tolerate both the raw entity and a { data } envelope.
    return (body && body.data ? body.data : body) as OrderTrackingDetail;
  }
}

// Export singleton instance
export const workflowService = WorkflowService;
