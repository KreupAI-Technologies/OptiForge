import { coreService } from './core.service';

const USE_MOCK_DATA = false;

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ReportTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  description?: string;
  category: string;
  subCategory?: string;
  reportType: string;
  dataSource: string;
  defaultFilters?: Record<string, unknown>;
  availableFilters?: Record<string, unknown>;
  columns?: Record<string, unknown>[];
  chartConfig?: Record<string, unknown>;
  outputFormats: string[];
  defaultFormat: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface SavedReport {
  id: string;
  reportCode: string;
  reportName: string;
  description?: string;
  templateId?: string;
  template?: ReportTemplate;
  category: string;
  filters?: Record<string, unknown>;
  columns?: Record<string, unknown>[];
  chartConfig?: Record<string, unknown>;
  sortOrder?: Record<string, unknown>;
  groupBy: string[];
  dateRangeType?: string;
  dateFrom?: string;
  dateTo?: string;
  outputFormat: string;
  createdById: string;
  createdByName?: string;
  isShared: boolean;
  sharedWith: string[];
  lastRunAt?: string;
  runCount: number;
  isFavorite: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSchedule {
  id: string;
  scheduleCode: string;
  scheduleName: string;
  description?: string;
  savedReportId?: string;
  savedReport?: SavedReport;
  templateId?: string;
  template?: ReportTemplate;
  frequency: string;
  cronExpression?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  minute: number;
  timezone: string;
  reportPeriod?: string;
  deliveryMethod: string;
  recipients?: { email: string; name: string; type: string }[];
  emailSubject?: string;
  outputFormat: string;
  status: string;
  nextRunAt?: string;
  lastRunAt?: string;
  lastRunStatus?: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

export interface ReportExecution {
  id: string;
  executionCode: string;
  savedReportId?: string;
  savedReport?: SavedReport;
  scheduleId?: string;
  schedule?: ReportSchedule;
  executionType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  filters?: Record<string, unknown>;
  dateFrom?: string;
  dateTo?: string;
  outputFormat?: string;
  resultFileUrl?: string;
  resultFileName?: string;
  resultFileSize?: number;
  recordCount?: number;
  errorMessage?: string;
  deliveryStatus?: string;
  executedById?: string;
  executedByName?: string;
  createdAt: string;
}

export interface AnalyticsDashboard {
  id: string;
  dashboardCode: string;
  dashboardName: string;
  description?: string;
  category?: string;
  layout?: Record<string, unknown>;
  widgets?: Record<string, unknown>[];
  theme: string;
  autoRefresh: boolean;
  refreshInterval?: number;
  isDefault: boolean;
  isPublic: boolean;
  createdById: string;
  createdByName?: string;
  viewCount: number;
  lastViewedAt?: string;
  isFavorite: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface KPIDefinition {
  id: string;
  kpiCode: string;
  kpiName: string;
  description?: string;
  category: string;
  subCategory?: string;
  formula?: string;
  dataSource: string;
  aggregationType: string;
  unit?: string;
  targetValue?: number;
  targetType?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  thresholdDirection: string;
  displayFormat?: string;
  chartType?: string;
  periodType: string;
  values?: KPIValue[];
  isActive: boolean;
  createdAt: string;
}

export interface KPIValue {
  id: string;
  kpiId: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  fiscalYear?: string;
  actualValue: number;
  targetValue?: number;
  previousValue?: number;
  variance?: number;
  variancePercent?: number;
  status?: string;
  trend?: string;
  trendPercent?: number;
  breakdown?: Record<string, unknown>;
  calculatedAt: string;
}

export interface FinanceAnalytics {
  id: string;
  snapshotDate: string;
  periodType: string;
  totalRevenue?: number;
  revenueGrowth?: number;
  totalExpenses?: number;
  expenseGrowth?: number;
  grossProfit?: number;
  grossMargin?: number;
  netProfit?: number;
  netMargin?: number;
  cashBalance?: number;
  cashFlow?: number;
  totalAR?: number;
  dso?: number;
  totalAP?: number;
  dpo?: number;
  revenueByCategory?: Record<string, number>;
  expenseByCategory?: Record<string, number>;
}

export interface SalesAnalytics {
  id: string;
  snapshotDate: string;
  periodType: string;
  totalOrders: number;
  totalOrderValue?: number;
  avgOrderValue?: number;
  totalQuotes: number;
  totalQuoteValue?: number;
  quoteConversionRate?: number;
  pipelineValue?: number;
  pipelineCount: number;
  newLeads: number;
  convertedLeads: number;
  leadConversionRate?: number;
  topProducts?: { productId: string; name: string; quantity: number; value: number }[];
  topCustomers?: { customerId: string; name: string; value: number }[];
  salesByRegion?: Record<string, number>;
}

export interface InventoryAnalytics {
  id: string;
  snapshotDate: string;
  periodType: string;
  totalValue?: number;
  valueChange?: number;
  totalItems: number;
  totalSKUs: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockCount: number;
  receiptsCount: number;
  issuesCount: number;
  inventoryTurnover?: number;
  daysOnHand?: number;
  valueByCategory?: Record<string, number>;
  valueByLocation?: Record<string, number>;
}

export interface HRAnalytics {
  id: string;
  snapshotDate: string;
  periodType: string;
  totalHeadcount: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  turnoverRate?: number;
  avgAttendanceRate?: number;
  totalLeavesTaken: number;
  totalPayroll?: number;
  avgSalary?: number;
  avgPerformanceScore?: number;
  headcountByDept?: Record<string, number>;
  payrollByDept?: Record<string, number>;
}

export interface ProductionAnalytics {
  id: string;
  snapshotDate: string;
  periodType: string;
  totalWorkOrders: number;
  completedWOs: number;
  inProgressWOs: number;
  delayedWOs: number;
  onTimeCompletion?: number;
  totalOutput?: number;
  oee?: number;
  availability?: number;
  performance?: number;
  quality?: number;
  machineUtilization?: number;
  totalProductionCost?: number;
  costPerUnit?: number;
  outputByWorkcenter?: Record<string, number>;
}

export interface QualityAnalytics {
  id: string;
  snapshotDate: string;
  periodType: string;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  passRate?: number;
  totalNCRs: number;
  openNCRs: number;
  totalCAPAs: number;
  openCAPAs: number;
  overdueCAPAs: number;
  totalDefects: number;
  defectsPerUnit?: number;
  totalComplaints: number;
  resolvedComplaints: number;
  defectsByType?: Record<string, number>;
}

export interface ReportsOverview {
  totalReports: number;
  favoriteReports: number;
  scheduledReports: number;
  recentExecutions: ReportExecution[];
  dashboards: number;
}

export interface ReportsSettings {
  id: string;
  companyId: string;
  defaultDateRange: string;
  defaultOutputFormat: string;
  fiscalYearStart: number;
  emailFromName?: string;
  emailFromAddress?: string;
  reportStorageDays: number;
  snapshotRetentionDays: number;
  maxScheduledReports: number;
  enableScheduling: boolean;
  enableSharing: boolean;
  enableExport: boolean;
  enableDrilldown: boolean;
  reportLogo?: string;
  reportHeaderText?: string;
  reportFooterText?: string;
}

// ============================================
// MOCK DATA
// ============================================

const mockReportTemplates: ReportTemplate[] = [
  {
    id: '1',
    templateCode: 'TPL-FIN-001',
    templateName: 'Balance Sheet',
    description: 'Standard balance sheet report',
    category: 'finance',
    subCategory: 'balance_sheet',
    reportType: 'summary',
    dataSource: 'finance_accounts',
    outputFormats: ['pdf', 'excel'],
    defaultFormat: 'pdf',
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    templateCode: 'TPL-FIN-002',
    templateName: 'Profit & Loss Statement',
    description: 'Income statement report',
    category: 'finance',
    subCategory: 'pl',
    reportType: 'summary',
    dataSource: 'finance_transactions',
    outputFormats: ['pdf', 'excel'],
    defaultFormat: 'pdf',
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    templateCode: 'TPL-SALES-001',
    templateName: 'Sales Performance',
    description: 'Sales performance by salesperson',
    category: 'sales',
    subCategory: 'performance',
    reportType: 'detail',
    dataSource: 'sales_orders',
    outputFormats: ['pdf', 'excel', 'csv'],
    defaultFormat: 'pdf',
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    templateCode: 'TPL-INV-001',
    templateName: 'Stock Valuation',
    description: 'Inventory valuation report',
    category: 'inventory',
    subCategory: 'valuation',
    reportType: 'summary',
    dataSource: 'inventory_items',
    outputFormats: ['pdf', 'excel'],
    defaultFormat: 'excel',
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    templateCode: 'TPL-HR-001',
    templateName: 'Payroll Summary',
    description: 'Monthly payroll summary report',
    category: 'hr',
    subCategory: 'payroll',
    reportType: 'summary',
    dataSource: 'hr_payroll',
    outputFormats: ['pdf', 'excel'],
    defaultFormat: 'pdf',
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    templateCode: 'TPL-PROD-001',
    templateName: 'Production Performance',
    description: 'Work order performance metrics',
    category: 'production',
    subCategory: 'performance',
    reportType: 'detail',
    dataSource: 'production_work_orders',
    outputFormats: ['pdf', 'excel'],
    defaultFormat: 'pdf',
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    templateCode: 'TPL-QA-001',
    templateName: 'Quality Metrics',
    description: 'Quality inspection and NCR metrics',
    category: 'quality',
    subCategory: 'metrics',
    reportType: 'dashboard',
    dataSource: 'quality_inspections',
    outputFormats: ['pdf', 'excel'],
    defaultFormat: 'pdf',
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const mockSavedReports: SavedReport[] = [
  {
    id: '1',
    reportCode: 'RPT-001',
    reportName: 'Monthly Balance Sheet',
    description: 'End of month balance sheet',
    category: 'finance',
    dateRangeType: 'month',
    outputFormat: 'pdf',
    createdById: 'user-1',
    createdByName: 'John Admin',
    isShared: true,
    sharedWith: ['all'],
    lastRunAt: new Date().toISOString(),
    runCount: 24,
    isFavorite: true,
    isActive: true,
    groupBy: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    reportCode: 'RPT-002',
    reportName: 'Weekly Sales Report',
    description: 'Weekly sales performance by region',
    category: 'sales',
    dateRangeType: 'week',
    outputFormat: 'excel',
    createdById: 'user-1',
    createdByName: 'John Admin',
    isShared: true,
    sharedWith: ['sales-team'],
    lastRunAt: new Date().toISOString(),
    runCount: 52,
    isFavorite: true,
    isActive: true,
    groupBy: ['region'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockOverview: ReportsOverview = {
  totalReports: 45,
  favoriteReports: 8,
  scheduledReports: 12,
  recentExecutions: [],
  dashboards: 6,
};

// ============================================
// SERVICE CLASS
// ============================================

class ReportsManagementService {
  private baseUrl = '/api/reports';

  // ============================================
  // REPORT TEMPLATES
  // ============================================

  async getReportTemplates(params?: {
    category?: string;
    reportType?: string;
    search?: string;
  }): Promise<ReportTemplate[]> {
    if (USE_MOCK_DATA) {
      let templates = [...mockReportTemplates];
      if (params?.category) {
        templates = templates.filter(t => t.category === params.category);
      }
      if (params?.search) {
        const search = params.search.toLowerCase();
        templates = templates.filter(t =>
          t.templateName.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
        );
      }
      return templates;
    }
    return coreService.request<ReportTemplate[]>({
      method: 'GET',
      url: `${this.baseUrl}/templates`,
      params,
    });
  }

  async getReportTemplateById(id: string): Promise<ReportTemplate | null> {
    if (USE_MOCK_DATA) {
      return mockReportTemplates.find(t => t.id === id) || null;
    }
    return coreService.request<ReportTemplate>({
      method: 'GET',
      url: `${this.baseUrl}/templates/${id}`,
    });
  }

  // ============================================
  // SAVED REPORTS
  // ============================================

  async getSavedReports(params?: {
    category?: string;
    isFavorite?: boolean;
    isShared?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ reports: SavedReport[]; total: number; page: number; limit: number; totalPages: number }> {
    if (USE_MOCK_DATA) {
      let reports = [...mockSavedReports];
      if (params?.category) {
        reports = reports.filter(r => r.category === params.category);
      }
      if (params?.isFavorite !== undefined) {
        reports = reports.filter(r => r.isFavorite === params.isFavorite);
      }
      return {
        reports,
        total: reports.length,
        page: params?.page || 1,
        limit: params?.limit || 20,
        totalPages: 1,
      };
    }
    return coreService.request({
      method: 'GET',
      url: `${this.baseUrl}/saved`,
      params,
    });
  }

  async getSavedReportById(id: string): Promise<SavedReport | null> {
    if (USE_MOCK_DATA) {
      return mockSavedReports.find(r => r.id === id) || null;
    }
    return coreService.request<SavedReport>({
      method: 'GET',
      url: `${this.baseUrl}/saved/${id}`,
    });
  }

  async createSavedReport(data: Partial<SavedReport>): Promise<SavedReport> {
    if (USE_MOCK_DATA) {
      const newReport: SavedReport = {
        id: `${Date.now()}`,
        reportCode: `RPT-${Date.now()}`,
        reportName: data.reportName || 'New Report',
        category: data.category || 'finance',
        outputFormat: data.outputFormat || 'pdf',
        createdById: 'user-1',
        createdByName: 'John Admin',
        isShared: false,
        sharedWith: [],
        runCount: 0,
        isFavorite: false,
        isActive: true,
        groupBy: data.groupBy || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      mockSavedReports.push(newReport);
      return newReport;
    }
    return coreService.request<SavedReport>({
      method: 'POST',
      url: `${this.baseUrl}/saved`,
      data,
    });
  }

  async updateSavedReport(id: string, data: Partial<SavedReport>): Promise<SavedReport> {
    if (USE_MOCK_DATA) {
      const index = mockSavedReports.findIndex(r => r.id === id);
      if (index >= 0) {
        mockSavedReports[index] = { ...mockSavedReports[index], ...data, updatedAt: new Date().toISOString() };
        return mockSavedReports[index];
      }
      throw new Error('Report not found');
    }
    return coreService.request<SavedReport>({
      method: 'PUT',
      url: `${this.baseUrl}/saved/${id}`,
      data,
    });
  }

  async deleteSavedReport(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const index = mockSavedReports.findIndex(r => r.id === id);
      if (index >= 0) {
        mockSavedReports.splice(index, 1);
      }
      return;
    }
    return coreService.request({
      method: 'DELETE',
      url: `${this.baseUrl}/saved/${id}`,
    });
  }

  async toggleFavorite(id: string): Promise<SavedReport> {
    if (USE_MOCK_DATA) {
      const report = mockSavedReports.find(r => r.id === id);
      if (report) {
        report.isFavorite = !report.isFavorite;
        return report;
      }
      throw new Error('Report not found');
    }
    return coreService.request<SavedReport>({
      method: 'POST',
      url: `${this.baseUrl}/saved/${id}/toggle-favorite`,
    });
  }

  // ============================================
  // REPORT SCHEDULES
  // ============================================

  async getReportSchedules(params?: {
    status?: string;
    frequency?: string;
  }): Promise<ReportSchedule[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return coreService.request<ReportSchedule[]>({
      method: 'GET',
      url: `${this.baseUrl}/schedules`,
      params,
    });
  }

  async createReportSchedule(data: Partial<ReportSchedule>): Promise<ReportSchedule> {
    if (USE_MOCK_DATA) {
      throw new Error('Not implemented in mock mode');
    }
    return coreService.request<ReportSchedule>({
      method: 'POST',
      url: `${this.baseUrl}/schedules`,
      data,
    });
  }

  async updateReportSchedule(id: string, data: Partial<ReportSchedule>): Promise<ReportSchedule> {
    if (USE_MOCK_DATA) {
      throw new Error('Not implemented in mock mode');
    }
    return coreService.request<ReportSchedule>({
      method: 'PUT',
      url: `${this.baseUrl}/schedules/${id}`,
      data,
    });
  }

  async toggleScheduleStatus(id: string): Promise<ReportSchedule> {
    if (USE_MOCK_DATA) {
      throw new Error('Not implemented in mock mode');
    }
    return coreService.request<ReportSchedule>({
      method: 'POST',
      url: `${this.baseUrl}/schedules/${id}/toggle-status`,
    });
  }

  // ============================================
  // REPORT EXECUTIONS
  // ============================================

  async getReportExecutions(params?: {
    savedReportId?: string;
    scheduleId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ executions: ReportExecution[]; total: number }> {
    if (USE_MOCK_DATA) {
      return { executions: [], total: 0 };
    }
    return coreService.request({
      method: 'GET',
      url: `${this.baseUrl}/executions`,
      params,
    });
  }

  async runReport(savedReportId: string, params?: {
    dateFrom?: string;
    dateTo?: string;
    outputFormat?: string;
  }): Promise<ReportExecution> {
    if (USE_MOCK_DATA) {
      throw new Error('Not implemented in mock mode');
    }
    return coreService.request<ReportExecution>({
      method: 'POST',
      url: `${this.baseUrl}/saved/${savedReportId}/run`,
      data: params,
    });
  }

  // ============================================
  // ANALYTICS DASHBOARDS
  // ============================================

  async getAnalyticsDashboards(params?: {
    category?: string;
  }): Promise<AnalyticsDashboard[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return coreService.request<AnalyticsDashboard[]>({
      method: 'GET',
      url: `${this.baseUrl}/dashboards`,
      params,
    });
  }

  async getAnalyticsDashboardById(id: string): Promise<AnalyticsDashboard | null> {
    if (USE_MOCK_DATA) {
      return null;
    }
    return coreService.request<AnalyticsDashboard>({
      method: 'GET',
      url: `${this.baseUrl}/dashboards/${id}`,
    });
  }

  async createAnalyticsDashboard(data: Partial<AnalyticsDashboard>): Promise<AnalyticsDashboard> {
    if (USE_MOCK_DATA) {
      throw new Error('Not implemented in mock mode');
    }
    return coreService.request<AnalyticsDashboard>({
      method: 'POST',
      url: `${this.baseUrl}/dashboards`,
      data,
    });
  }

  // ============================================
  // KPI MANAGEMENT
  // ============================================

  async getKPIDefinitions(params?: {
    category?: string;
  }): Promise<KPIDefinition[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return coreService.request<KPIDefinition[]>({
      method: 'GET',
      url: `${this.baseUrl}/kpis`,
      params,
    });
  }

  async getKPIDefinitionById(id: string): Promise<KPIDefinition | null> {
    if (USE_MOCK_DATA) {
      return null;
    }
    return coreService.request<KPIDefinition>({
      method: 'GET',
      url: `${this.baseUrl}/kpis/${id}`,
    });
  }

  // ============================================
  // ANALYTICS SNAPSHOTS
  // ============================================

  async getFinanceAnalytics(periodType = 'monthly', limit = 12): Promise<FinanceAnalytics[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return coreService.request<FinanceAnalytics[]>({
      method: 'GET',
      url: `${this.baseUrl}/analytics/finance`,
      params: { periodType, limit },
    });
  }

  async getSalesAnalytics(periodType = 'monthly', limit = 12): Promise<SalesAnalytics[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return coreService.request<SalesAnalytics[]>({
      method: 'GET',
      url: `${this.baseUrl}/analytics/sales`,
      params: { periodType, limit },
    });
  }

  async getInventoryAnalytics(periodType = 'monthly', limit = 12): Promise<InventoryAnalytics[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return coreService.request<InventoryAnalytics[]>({
      method: 'GET',
      url: `${this.baseUrl}/analytics/inventory`,
      params: { periodType, limit },
    });
  }

  async getHRAnalytics(periodType = 'monthly', limit = 12): Promise<HRAnalytics[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return coreService.request<HRAnalytics[]>({
      method: 'GET',
      url: `${this.baseUrl}/analytics/hr`,
      params: { periodType, limit },
    });
  }

  async getProductionAnalytics(periodType = 'monthly', limit = 12): Promise<ProductionAnalytics[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return coreService.request<ProductionAnalytics[]>({
      method: 'GET',
      url: `${this.baseUrl}/analytics/production`,
      params: { periodType, limit },
    });
  }

  async getQualityAnalytics(periodType = 'monthly', limit = 12): Promise<QualityAnalytics[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return coreService.request<QualityAnalytics[]>({
      method: 'GET',
      url: `${this.baseUrl}/analytics/quality`,
      params: { periodType, limit },
    });
  }

  // ============================================
  // REPORTS OVERVIEW
  // ============================================

  async getReportsOverview(): Promise<ReportsOverview> {
    if (USE_MOCK_DATA) {
      return mockOverview;
    }
    return coreService.request<ReportsOverview>({
      method: 'GET',
      url: `${this.baseUrl}/overview`,
    });
  }

  async getReportsByCategory(): Promise<{ category: string; count: number }[]> {
    if (USE_MOCK_DATA) {
      const categories: Record<string, number> = {};
      mockSavedReports.forEach(r => {
        categories[r.category] = (categories[r.category] || 0) + 1;
      });
      return Object.entries(categories).map(([category, count]) => ({ category, count }));
    }
    return coreService.request({
      method: 'GET',
      url: `${this.baseUrl}/by-category`,
    });
  }

  // ============================================
  // SETTINGS
  // ============================================

  async getReportsSettings(): Promise<ReportsSettings> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        companyId: 'company-1',
        defaultDateRange: 'month',
        defaultOutputFormat: 'pdf',
        fiscalYearStart: 4,
        reportStorageDays: 90,
        snapshotRetentionDays: 365,
        maxScheduledReports: 50,
        enableScheduling: true,
        enableSharing: true,
        enableExport: true,
        enableDrilldown: true,
      };
    }
    return coreService.request<ReportsSettings>({
      method: 'GET',
      url: `${this.baseUrl}/settings`,
    });
  }

  async updateReportsSettings(data: Partial<ReportsSettings>): Promise<ReportsSettings> {
    if (USE_MOCK_DATA) {
      throw new Error('Not implemented in mock mode');
    }
    return coreService.request<ReportsSettings>({
      method: 'PUT',
      url: `${this.baseUrl}/settings`,
      data,
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  getReportCategories(): { value: string; label: string; icon?: string }[] {
    return [
      { value: 'finance', label: 'Finance Reports', icon: 'currency' },
      { value: 'sales', label: 'Sales Reports', icon: 'chart' },
      { value: 'inventory', label: 'Inventory Reports', icon: 'box' },
      { value: 'hr', label: 'HR Reports', icon: 'users' },
      { value: 'production', label: 'Production Reports', icon: 'factory' },
      { value: 'quality', label: 'Quality Reports', icon: 'check-circle' },
    ];
  }

  getReportFrequencies(): { value: string; label: string }[] {
    return [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'yearly', label: 'Yearly' },
    ];
  }

  getOutputFormats(): { value: string; label: string }[] {
    return [
      { value: 'pdf', label: 'PDF' },
      { value: 'excel', label: 'Excel' },
      { value: 'csv', label: 'CSV' },
      { value: 'html', label: 'HTML' },
    ];
  }

  getDateRangeTypes(): { value: string; label: string }[] {
    return [
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: 'week', label: 'This Week' },
      { value: 'last_week', label: 'Last Week' },
      { value: 'month', label: 'This Month' },
      { value: 'last_month', label: 'Last Month' },
      { value: 'quarter', label: 'This Quarter' },
      { value: 'last_quarter', label: 'Last Quarter' },
      { value: 'year', label: 'This Year' },
      { value: 'last_year', label: 'Last Year' },
      { value: 'custom', label: 'Custom Range' },
    ];
  }
}

export const reportsManagementService = new ReportsManagementService();

// ============================================================================
// REPORT DATASETS (generic pre-computed report payloads)
// ============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const DEFAULT_COMPANY_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || 'default';

export interface ReportDataset<T = Record<string, unknown>> {
  id: string;
  companyId: string;
  reportKey: string;
  title?: string;
  category?: string;
  payload?: T;
  isActive: boolean;
}

/**
 * Fetch a stored report dataset by key from the reports backend.
 * Returns the `payload` (the page's render data) or null when no dataset has
 * been stored yet — callers should fall back to their built-in defaults.
 */
export async function fetchReportDataset<T = Record<string, unknown>>(
  reportKey: string,
  companyId: string = DEFAULT_COMPANY_ID,
): Promise<T | null> {
  const url = `${API_BASE_URL}/reports/datasets/${encodeURIComponent(
    reportKey,
  )}?companyId=${encodeURIComponent(companyId)}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to load report dataset "${reportKey}" (${res.status})`);
  }

  const body = (await res.json()) as ReportDataset<T> | null;
  if (!body || !body.payload) return null;
  return body.payload;
}

export interface ReportRowsResponse<T = Record<string, unknown>> {
  reportKey: string;
  title: string | null;
  rows: T[];
  summary: Record<string, unknown>;
}

/**
 * Fetch the tabular rows for a report detail page, keyed by reportKey
 * (e.g. "sales.orders.status"). Always resolves to an array (empty when no
 * dataset has been stored yet) so pages can render loading/empty states without
 * special-casing. Throws only on network / non-OK responses.
 */
export async function fetchReportRows<T = Record<string, unknown>>(
  reportKey: string,
  companyId: string = DEFAULT_COMPANY_ID,
): Promise<T[]> {
  const url = `${API_BASE_URL}/reports/datasets/${encodeURIComponent(
    reportKey,
  )}/rows?companyId=${encodeURIComponent(companyId)}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to load report rows "${reportKey}" (${res.status})`);
  }

  const body = (await res.json()) as ReportRowsResponse<T> | null;
  if (!body || !Array.isArray(body.rows)) return [];
  return body.rows;
}

// ============================================================================
// REPORT CATALOG (available reports grouped by module)
// ============================================================================

export interface ReportCatalogItem {
  id: string;
  companyId: string;
  module: string;
  name: string;
  description?: string;
  category?: string;
  frequency?: string;
  href?: string;
  lastGenerated?: string;
  sortOrder?: number;
  isActive: boolean;
}

/**
 * Fetch the report catalog for a module (e.g. "financial", "hr"). Always
 * resolves to an array — returns [] on any network / non-OK response so the
 * calling page can fall back to its built-in defaults without special-casing.
 */
export async function fetchReportCatalog(
  module: string,
  companyId: string = DEFAULT_COMPANY_ID,
): Promise<ReportCatalogItem[]> {
  const url = `${API_BASE_URL}/reports/catalog?companyId=${encodeURIComponent(
    companyId,
  )}&module=${encodeURIComponent(module)}`;

  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to load report catalog "${module}" (${res.status})`);
  }
  const body = (await res.json()) as ReportCatalogItem[] | null;
  return Array.isArray(body) ? body : [];
}

// ============================================================================
// SAVED / CUSTOM REPORTS ("My Reports" on the custom report builder)
// ============================================================================

export interface ReportSavedItem {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category?: string;
  dataSource?: string;
  config?: Record<string, unknown>;
  outputFormat: string;
  createdByName?: string;
  isFavorite: boolean;
  isShared: boolean;
  runCount: number;
  lastRunAt?: string;
  isActive: boolean;
}

/**
 * Fetch saved / custom reports for a company. Always resolves to an array
 * (empty on non-OK responses) so pages can render empty states cleanly.
 */
export async function fetchSavedReportItems(
  companyId: string = DEFAULT_COMPANY_ID,
  category?: string,
): Promise<ReportSavedItem[]> {
  const params = new URLSearchParams({ companyId });
  if (category) params.set('category', category);
  const url = `${API_BASE_URL}/reports/saved-items?${params.toString()}`;

  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to load saved reports (${res.status})`);
  }
  const body = (await res.json()) as ReportSavedItem[] | null;
  return Array.isArray(body) ? body : [];
}
