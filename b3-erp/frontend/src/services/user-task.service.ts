// Workflow User Task Service
// Handles user task inbox, task actions, and task counts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Types & Interfaces
// ============================================================================

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELEGATED = 'delegated',
  EXPIRED = 'expired',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TaskType {
  APPROVAL = 'approval',
  REVIEW = 'review',
  ACTION = 'action',
  INFORMATION = 'information',
}

export interface UserTask {
  id: string;
  workflowInstanceId: string;
  workflowName: string;
  stepId: string;
  stepName: string;
  taskType: TaskType;
  title: string;
  description: string;
  entityType: string;
  entityId: string;
  entityName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeType: 'user' | 'role' | 'department';
  delegatedFrom?: string;
  delegatedFromName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  availableActions: TaskAction[];
  dueDate?: Date;
  reminderSent: boolean;
  escalated: boolean;
  escalatedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  completedBy?: string;
  metadata?: Record<string, any>;
}

export interface TaskAction {
  code: string;
  label: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  requiresComment: boolean;
  confirmationMessage?: string;
}

export interface TaskCounts {
  total: number;
  pending: number;
  inProgress: number;
  overdue: number;
  dueSoon: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byType: {
    approval: number;
    review: number;
    action: number;
    information: number;
  };
}

export interface PerformTaskActionDto {
  taskId: string;
  action: string;
  comments?: string;
  delegateTo?: string;
  metadata?: Record<string, any>;
}

export interface TaskActionResult {
  success: boolean;
  message: string;
  task: UserTask;
  nextStepCreated: boolean;
  workflowCompleted: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_AVAILABLE_ACTIONS: Record<string, TaskAction[]> = {
  approval: [
    { code: 'approve', label: 'Approve', color: 'success', requiresComment: false },
    { code: 'reject', label: 'Reject', color: 'danger', requiresComment: true, confirmationMessage: 'Are you sure you want to reject this request?' },
    { code: 'request_info', label: 'Request Info', color: 'warning', requiresComment: true },
    { code: 'delegate', label: 'Delegate', color: 'default', requiresComment: true },
  ],
  review: [
    { code: 'complete', label: 'Complete Review', color: 'success', requiresComment: false },
    { code: 'request_changes', label: 'Request Changes', color: 'warning', requiresComment: true },
    { code: 'delegate', label: 'Delegate', color: 'default', requiresComment: true },
  ],
  action: [
    { code: 'complete', label: 'Mark Complete', color: 'success', requiresComment: false },
    { code: 'delegate', label: 'Delegate', color: 'default', requiresComment: true },
  ],
  information: [
    { code: 'acknowledge', label: 'Acknowledge', color: 'primary', requiresComment: false },
  ],
};

export const MOCK_USER_TASKS: UserTask[] = [
  {
    id: 'task-001',
    workflowInstanceId: 'instance-001',
    workflowName: 'Purchase Order Approval',
    stepId: 'step-3',
    stepName: 'Finance Review',
    taskType: TaskType.APPROVAL,
    title: 'Approve Purchase Order #0125',
    description: 'Review and approve purchase order for office supplies from Office Depot. Amount: $25,000',
    entityType: 'purchase_order',
    entityId: 'PO-2026-0125',
    entityName: 'Purchase Order #0125 - Office Supplies',
    assigneeId: 'user-005',
    assigneeName: 'Robert Wilson',
    assigneeType: 'user',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    availableActions: MOCK_AVAILABLE_ACTIONS.approval,
    dueDate: new Date('2026-01-28T17:00:00Z'),
    reminderSent: false,
    escalated: false,
    createdAt: new Date('2026-01-24T14:30:00Z'),
    updatedAt: new Date('2026-01-24T14:30:00Z'),
    metadata: { amount: 25000, vendor: 'Office Depot', department: 'Procurement' },
  },
  {
    id: 'task-002',
    workflowInstanceId: 'instance-002',
    workflowName: 'Leave Request Approval',
    stepId: 'step-2',
    stepName: 'Manager Approval',
    taskType: TaskType.APPROVAL,
    title: 'Approve Leave Request - Emily Davis',
    description: 'Review and approve vacation leave request for Emily Davis. Dates: Feb 10-14, 2026 (5 days)',
    entityType: 'leave_request',
    entityId: 'LR-2026-0089',
    entityName: 'Leave Request - Emily Davis',
    assigneeId: 'user-010',
    assigneeName: 'Lisa Anderson',
    assigneeType: 'user',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    availableActions: MOCK_AVAILABLE_ACTIONS.approval,
    dueDate: new Date('2026-01-26T17:00:00Z'),
    reminderSent: true,
    escalated: false,
    createdAt: new Date('2026-01-25T08:00:00Z'),
    updatedAt: new Date('2026-01-25T08:00:00Z'),
    metadata: { leaveType: 'vacation', startDate: '2026-02-10', endDate: '2026-02-14', days: 5 },
  },
  {
    id: 'task-003',
    workflowInstanceId: 'instance-004',
    workflowName: 'Purchase Order Approval',
    stepId: 'step-2',
    stepName: 'Manager Approval',
    taskType: TaskType.APPROVAL,
    title: 'Re-submit Purchase Order #0118',
    description: 'Review updated vendor quote and re-approve purchase order for manufacturing equipment',
    entityType: 'purchase_order',
    entityId: 'PO-2026-0118',
    entityName: 'Purchase Order #0118 - Manufacturing Equipment',
    assigneeId: 'user-001',
    assigneeName: 'John Smith',
    assigneeType: 'user',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.CRITICAL,
    availableActions: MOCK_AVAILABLE_ACTIONS.approval,
    dueDate: new Date('2026-01-27T17:00:00Z'),
    reminderSent: true,
    escalated: true,
    escalatedTo: 'user-001',
    createdAt: new Date('2026-01-22T10:00:00Z'),
    updatedAt: new Date('2026-01-25T09:00:00Z'),
    metadata: { amount: 85000, vendor: 'Industrial Machines Co', department: 'Production' },
  },
  {
    id: 'task-004',
    workflowInstanceId: 'instance-006',
    workflowName: 'New Employee Onboarding',
    stepId: 'step-4',
    stepName: 'IT Setup Review',
    taskType: TaskType.REVIEW,
    title: 'Review IT Setup - New Employee',
    description: 'Verify IT equipment and system access setup for new employee Mark Thompson',
    entityType: 'employee',
    entityId: 'emp-045',
    entityName: 'Mark Thompson - IT Setup',
    assigneeId: 'user-009',
    assigneeName: 'James Taylor',
    assigneeType: 'user',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    availableActions: MOCK_AVAILABLE_ACTIONS.review,
    dueDate: new Date('2026-01-30T17:00:00Z'),
    reminderSent: false,
    escalated: false,
    createdAt: new Date('2026-01-23T11:00:00Z'),
    updatedAt: new Date('2026-01-23T11:00:00Z'),
    metadata: { department: 'Production', manager: 'Michael Chen', startDate: '2026-02-01' },
  },
  {
    id: 'task-005',
    workflowInstanceId: 'instance-007',
    workflowName: 'Sales Order Approval',
    stepId: 'step-2',
    stepName: 'Manager Approval',
    taskType: TaskType.APPROVAL,
    title: 'Approve Sales Order with Discount',
    description: 'Review and approve sales order with 15% discount for VIP customer Acme Corp',
    entityType: 'sales_order',
    entityId: 'SO-2026-0892',
    entityName: 'Sales Order #0892 - Acme Corp',
    assigneeId: 'user-010',
    assigneeName: 'Lisa Anderson',
    assigneeType: 'user',
    delegatedFrom: 'user-004',
    delegatedFromName: 'Emily Davis',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    availableActions: MOCK_AVAILABLE_ACTIONS.approval,
    dueDate: new Date('2026-01-27T12:00:00Z'),
    reminderSent: false,
    escalated: false,
    createdAt: new Date('2026-01-25T10:30:00Z'),
    updatedAt: new Date('2026-01-25T14:00:00Z'),
    metadata: { orderAmount: 45000, discountPercent: 15, customer: 'Acme Corp' },
  },
  {
    id: 'task-006',
    workflowInstanceId: 'instance-008',
    workflowName: 'Expense Claim Approval',
    stepId: 'step-2',
    stepName: 'Manager Review',
    taskType: TaskType.APPROVAL,
    title: 'Approve Expense Claim - Conference Travel',
    description: 'Review expense claim for industry conference attendance',
    entityType: 'expense_claim',
    entityId: 'EC-2026-0041',
    entityName: 'Expense Claim - Conference Travel',
    assigneeId: 'user-003',
    assigneeName: 'Michael Chen',
    assigneeType: 'user',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    availableActions: MOCK_AVAILABLE_ACTIONS.approval,
    dueDate: new Date('2026-02-01T17:00:00Z'),
    reminderSent: false,
    escalated: false,
    createdAt: new Date('2026-01-24T16:00:00Z'),
    updatedAt: new Date('2026-01-24T16:00:00Z'),
    metadata: { amount: 2800, category: 'Conference', receipts: 8 },
  },
  {
    id: 'task-007',
    workflowInstanceId: 'instance-009',
    workflowName: 'Warranty Claim Processing',
    stepId: 'step-3',
    stepName: 'Technical Assessment',
    taskType: TaskType.ACTION,
    title: 'Complete Technical Assessment',
    description: 'Perform technical inspection of returned product and document findings',
    entityType: 'warranty_claim',
    entityId: 'WC-2026-0095',
    entityName: 'Warranty Claim #0095 - Faulty Controller',
    assigneeId: 'user-006',
    assigneeName: 'Jennifer Martinez',
    assigneeType: 'user',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    availableActions: MOCK_AVAILABLE_ACTIONS.action,
    dueDate: new Date('2026-01-29T17:00:00Z'),
    reminderSent: false,
    escalated: false,
    createdAt: new Date('2026-01-22T09:00:00Z'),
    updatedAt: new Date('2026-01-25T11:00:00Z'),
    metadata: { productId: 'PROD-789', serialNumber: 'SN-12345678', claimAmount: 1500 },
  },
  {
    id: 'task-008',
    workflowInstanceId: 'instance-010',
    workflowName: 'Contract Review & Approval',
    stepId: 'step-2',
    stepName: 'Legal Review',
    taskType: TaskType.REVIEW,
    title: 'Legal Review - Vendor Contract',
    description: 'Review terms and conditions of proposed vendor agreement',
    entityType: 'contract',
    entityId: 'CONTRACT-2026-0012',
    entityName: 'Vendor Agreement - Tech Solutions Inc',
    assigneeId: 'role-legal',
    assigneeName: 'Legal Department',
    assigneeType: 'role',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    availableActions: MOCK_AVAILABLE_ACTIONS.review,
    dueDate: new Date('2026-01-31T17:00:00Z'),
    reminderSent: false,
    escalated: false,
    createdAt: new Date('2026-01-20T14:00:00Z'),
    updatedAt: new Date('2026-01-20T14:00:00Z'),
    metadata: { contractValue: 150000, duration: '24 months', vendor: 'Tech Solutions Inc' },
  },
  {
    id: 'task-009',
    workflowInstanceId: 'instance-003',
    workflowName: 'Expense Claim Approval',
    stepId: 'step-end',
    stepName: 'Notification',
    taskType: TaskType.INFORMATION,
    title: 'Expense Reimbursement Processed',
    description: 'Your expense claim has been approved and processed for payment',
    entityType: 'expense_claim',
    entityId: 'EC-2026-0034',
    entityName: 'Expense Claim - Business Travel',
    assigneeId: 'user-004',
    assigneeName: 'Emily Davis',
    assigneeType: 'user',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    availableActions: MOCK_AVAILABLE_ACTIONS.information,
    reminderSent: false,
    escalated: false,
    createdAt: new Date('2026-01-20T16:00:00Z'),
    updatedAt: new Date('2026-01-20T16:15:00Z'),
    completedAt: new Date('2026-01-20T16:15:00Z'),
    completedBy: 'user-004',
    metadata: { amount: 1250, paymentRef: 'PAY-2026-0089' },
  },
  {
    id: 'task-010',
    workflowInstanceId: 'instance-011',
    workflowName: 'Inventory Adjustment Approval',
    stepId: 'step-2',
    stepName: 'Manager Approval',
    taskType: TaskType.APPROVAL,
    title: 'Approve Stock Write-off',
    description: 'Review and approve inventory write-off for damaged goods',
    entityType: 'stock_adjustment',
    entityId: 'ADJ-2026-0052',
    entityName: 'Stock Write-off - Damaged Inventory',
    assigneeId: 'user-007',
    assigneeName: 'David Lee',
    assigneeType: 'user',
    status: TaskStatus.EXPIRED,
    priority: TaskPriority.HIGH,
    availableActions: [],
    dueDate: new Date('2026-01-23T17:00:00Z'),
    reminderSent: true,
    escalated: true,
    escalatedTo: 'user-003',
    createdAt: new Date('2026-01-18T10:00:00Z'),
    updatedAt: new Date('2026-01-24T00:00:00Z'),
    metadata: { quantity: 50, totalValue: 7500, reason: 'Water damage' },
  },
];

// ============================================================================
// Service Class
// ============================================================================

export class UserTaskService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get task inbox for a specific user
   */
  static async getTaskInbox(userId: string): Promise<UserTask[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Return tasks assigned to the user that are not completed
      return MOCK_USER_TASKS.filter(
        (task) =>
          task.assigneeId === userId &&
          task.status !== TaskStatus.COMPLETED &&
          task.status !== TaskStatus.EXPIRED
      ).sort((a, b) => {
        // Sort by priority (critical first), then by due date
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
    }

    return this.request<UserTask[]>(`/api/workflow/tasks/inbox/${userId}`);
  }

  /**
   * Get task counts for a specific user
   */
  static async getTaskCounts(userId: string): Promise<TaskCounts> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const userTasks = MOCK_USER_TASKS.filter((task) => task.assigneeId === userId);
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const activeTasks = userTasks.filter(
        (t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.EXPIRED
      );

      return {
        total: activeTasks.length,
        pending: activeTasks.filter((t) => t.status === TaskStatus.PENDING).length,
        inProgress: activeTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
        overdue: activeTasks.filter(
          (t) => t.dueDate && new Date(t.dueDate) < now
        ).length,
        dueSoon: activeTasks.filter(
          (t) =>
            t.dueDate &&
            new Date(t.dueDate) >= now &&
            new Date(t.dueDate) <= threeDaysFromNow
        ).length,
        byPriority: {
          low: activeTasks.filter((t) => t.priority === TaskPriority.LOW).length,
          medium: activeTasks.filter((t) => t.priority === TaskPriority.MEDIUM).length,
          high: activeTasks.filter((t) => t.priority === TaskPriority.HIGH).length,
          critical: activeTasks.filter((t) => t.priority === TaskPriority.CRITICAL).length,
        },
        byType: {
          approval: activeTasks.filter((t) => t.taskType === TaskType.APPROVAL).length,
          review: activeTasks.filter((t) => t.taskType === TaskType.REVIEW).length,
          action: activeTasks.filter((t) => t.taskType === TaskType.ACTION).length,
          information: activeTasks.filter((t) => t.taskType === TaskType.INFORMATION).length,
        },
      };
    }

    return this.request<TaskCounts>(`/api/workflow/tasks/counts/${userId}`);
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(taskId: string): Promise<UserTask> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const task = MOCK_USER_TASKS.find((t) => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      return task;
    }

    return this.request<UserTask>(`/api/workflow/tasks/${taskId}`);
  }

  /**
   * Perform an action on a task
   */
  static async performTaskAction(data: PerformTaskActionDto): Promise<TaskActionResult> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const taskIndex = MOCK_USER_TASKS.findIndex((t) => t.id === data.taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const task = MOCK_USER_TASKS[taskIndex];

      // Validate action is available
      const actionAvailable = task.availableActions.some((a) => a.code === data.action);
      if (!actionAvailable) {
        throw new Error(`Action '${data.action}' is not available for this task`);
      }

      // Update task status based on action
      let newStatus = TaskStatus.COMPLETED;
      if (data.action === 'delegate') {
        newStatus = TaskStatus.DELEGATED;
      } else if (data.action === 'request_info' || data.action === 'request_changes') {
        newStatus = TaskStatus.PENDING;
      }

      const updatedTask: UserTask = {
        ...task,
        status: newStatus,
        updatedAt: new Date(),
        completedAt: newStatus === TaskStatus.COMPLETED ? new Date() : undefined,
        completedBy: 'current-user',
      };

      MOCK_USER_TASKS[taskIndex] = updatedTask;

      const isTerminalAction = ['approve', 'reject', 'complete', 'acknowledge'].includes(data.action);

      return {
        success: true,
        message: `Task ${data.action === 'approve' ? 'approved' : data.action === 'reject' ? 'rejected' : 'completed'} successfully`,
        task: updatedTask,
        nextStepCreated: isTerminalAction && data.action !== 'reject',
        workflowCompleted: data.action === 'reject' || (isTerminalAction && Math.random() > 0.5),
      };
    }

    return this.request<TaskActionResult>('/api/workflow/tasks/action', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delegate a task to another user
   */
  static async delegateTask(
    taskId: string,
    delegateTo: string,
    comments: string
  ): Promise<TaskActionResult> {
    return this.performTaskAction({
      taskId,
      action: 'delegate',
      delegateTo,
      comments,
    });
  }

  /**
   * Get tasks by workflow instance
   */
  static async getTasksByWorkflowInstance(instanceId: string): Promise<UserTask[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_USER_TASKS.filter((t) => t.workflowInstanceId === instanceId);
    }

    return this.request<UserTask[]>(`/api/workflow/tasks/instance/${instanceId}`);
  }

  /**
   * Get all pending tasks for a role
   */
  static async getTasksByRole(roleId: string): Promise<UserTask[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_USER_TASKS.filter(
        (t) =>
          t.assigneeType === 'role' &&
          t.assigneeId === roleId &&
          t.status === TaskStatus.PENDING
      );
    }

    return this.request<UserTask[]>(`/api/workflow/tasks/role/${roleId}`);
  }

  /**
   * Claim a role-assigned task
   */
  static async claimTask(taskId: string): Promise<UserTask> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const taskIndex = MOCK_USER_TASKS.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const updatedTask: UserTask = {
        ...MOCK_USER_TASKS[taskIndex],
        assigneeId: 'current-user',
        assigneeName: 'Current User',
        assigneeType: 'user',
        status: TaskStatus.IN_PROGRESS,
        updatedAt: new Date(),
      };

      MOCK_USER_TASKS[taskIndex] = updatedTask;
      return updatedTask;
    }

    return this.request<UserTask>(`/api/workflow/tasks/${taskId}/claim`, {
      method: 'POST',
    });
  }

  /**
   * Get overdue tasks summary
   */
  static async getOverdueTasks(): Promise<UserTask[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const now = new Date();
      return MOCK_USER_TASKS.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== TaskStatus.COMPLETED &&
          t.status !== TaskStatus.EXPIRED
      );
    }

    return this.request<UserTask[]>('/api/workflow/tasks/overdue');
  }
}

// Export singleton instance
export const userTaskService = UserTaskService;
