/**
 * Finance Service
 * Handles dashboard statistics and chart of accounts
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Type Definitions
// ============================================================================

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  description?: string;
  balance: number;
  currency: string;
  isReconcilable: boolean;
  isBankAccount: boolean;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
  children?: Account[];
}

export interface FinanceDashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  cashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  revenueGrowth: number;
  expenseGrowth: number;
  pendingInvoices: number;
  overdueInvoices: number;
  pendingPayments: number;
  recentTransactions: RecentTransaction[];
  monthlyRevenue: MonthlyData[];
  monthlyExpenses: MonthlyData[];
  topExpenseCategories: CategoryData[];
}

export interface RecentTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  accountName: string;
}

export interface MonthlyData {
  month: string;
  amount: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface CreateAccountDto {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  description?: string;
  currency?: string;
  isReconcilable?: boolean;
  isBankAccount?: boolean;
}

export interface UpdateAccountDto {
  name?: string;
  description?: string;
  status?: AccountStatus;
  isReconcilable?: boolean;
}

export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  reconciliationNumber: string;
  reconciliationDate: string;
  statementStartDate: string;
  statementEndDate: string;
  status: 'Draft' | 'In-Progress' | 'Completed' | 'Approved' | 'Closed';
  openingBalancePerBooks: number;
  closingBalancePerBooks: number;
  openingBalancePerBank: number;
  closingBalancePerBank: number;
  difference: number;
  createdBy: string;
  matches?: any[];
}

export interface StatutoryComplianceReport {
  companyId: string;
  reportType: string;
  period: { startDate: string; endDate: string };
  totalLiability: number;
  transactions: number;
  isCompliant: boolean;
  generatedAt: Date;
}

export interface BankStatementTransaction {
  id: string;
  transactionDate: string;
  valueDate: string;
  description: string;
  referenceNumber?: string;
  chequeNumber?: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  isMatched: boolean;
  status: 'Unmatched' | 'Matched' | 'Excluded';
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_ACCOUNTS: Account[] = [
  // Assets
  {
    id: 'acc-1',
    code: '1000',
    name: 'Cash and Cash Equivalents',
    type: AccountType.ASSET,
    description: 'All liquid assets including bank accounts',
    balance: 2450000,
    currency: 'USD',
    isReconcilable: true,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-2',
    code: '1100',
    name: 'Operating Bank Account',
    type: AccountType.ASSET,
    parentId: 'acc-1',
    description: 'Primary operating bank account',
    balance: 1850000,
    currency: 'USD',
    isReconcilable: true,
    isBankAccount: true,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-3',
    code: '1200',
    name: 'Petty Cash',
    type: AccountType.ASSET,
    parentId: 'acc-1',
    description: 'Small cash fund for minor expenses',
    balance: 5000,
    currency: 'USD',
    isReconcilable: true,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-4',
    code: '1300',
    name: 'Accounts Receivable',
    type: AccountType.ASSET,
    description: 'Money owed by customers',
    balance: 875000,
    currency: 'USD',
    isReconcilable: true,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-5',
    code: '1400',
    name: 'Inventory',
    type: AccountType.ASSET,
    description: 'Raw materials and finished goods',
    balance: 1250000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-6',
    code: '1500',
    name: 'Fixed Assets',
    type: AccountType.ASSET,
    description: 'Property, plant, and equipment',
    balance: 3500000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Liabilities
  {
    id: 'acc-7',
    code: '2000',
    name: 'Accounts Payable',
    type: AccountType.LIABILITY,
    description: 'Money owed to suppliers',
    balance: 425000,
    currency: 'USD',
    isReconcilable: true,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-8',
    code: '2100',
    name: 'Short-term Loans',
    type: AccountType.LIABILITY,
    description: 'Loans due within one year',
    balance: 250000,
    currency: 'USD',
    isReconcilable: true,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-9',
    code: '2200',
    name: 'Accrued Expenses',
    type: AccountType.LIABILITY,
    description: 'Expenses incurred but not yet paid',
    balance: 85000,
    currency: 'USD',
    isReconcilable: true,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-10',
    code: '2300',
    name: 'Long-term Debt',
    type: AccountType.LIABILITY,
    description: 'Loans and obligations due after one year',
    balance: 1500000,
    currency: 'USD',
    isReconcilable: true,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Equity
  {
    id: 'acc-11',
    code: '3000',
    name: 'Common Stock',
    type: AccountType.EQUITY,
    description: 'Issued common shares',
    balance: 2000000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-12',
    code: '3100',
    name: 'Retained Earnings',
    type: AccountType.EQUITY,
    description: 'Accumulated profits reinvested in the business',
    balance: 3420000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Revenue
  {
    id: 'acc-13',
    code: '4000',
    name: 'Sales Revenue',
    type: AccountType.REVENUE,
    description: 'Income from sales of goods and services',
    balance: 8750000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-14',
    code: '4100',
    name: 'Service Revenue',
    type: AccountType.REVENUE,
    description: 'Income from services provided',
    balance: 1250000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-15',
    code: '4200',
    name: 'Other Income',
    type: AccountType.REVENUE,
    description: 'Miscellaneous income sources',
    balance: 125000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Expenses
  {
    id: 'acc-16',
    code: '5000',
    name: 'Cost of Goods Sold',
    type: AccountType.EXPENSE,
    description: 'Direct costs of manufacturing',
    balance: 5250000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-17',
    code: '5100',
    name: 'Salaries and Wages',
    type: AccountType.EXPENSE,
    description: 'Employee compensation',
    balance: 1850000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-18',
    code: '5200',
    name: 'Rent and Utilities',
    type: AccountType.EXPENSE,
    description: 'Facility costs',
    balance: 420000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-19',
    code: '5300',
    name: 'Marketing and Advertising',
    type: AccountType.EXPENSE,
    description: 'Promotional expenses',
    balance: 185000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'acc-20',
    code: '5400',
    name: 'Depreciation',
    type: AccountType.EXPENSE,
    description: 'Asset depreciation expense',
    balance: 350000,
    currency: 'USD',
    isReconcilable: false,
    isBankAccount: false,
    status: AccountStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const MOCK_DASHBOARD_STATS: FinanceDashboardStats = {
  totalRevenue: 10125000,
  totalExpenses: 8055000,
  netIncome: 2070000,
  cashBalance: 1855000,
  accountsReceivable: 875000,
  accountsPayable: 425000,
  revenueGrowth: 12.5,
  expenseGrowth: 8.2,
  pendingInvoices: 24,
  overdueInvoices: 7,
  pendingPayments: 15,
  recentTransactions: [
    {
      id: 'txn-1',
      date: new Date('2024-01-15'),
      description: 'Payment from ABC Manufacturing',
      amount: 45000,
      type: 'credit',
      accountName: 'Accounts Receivable',
    },
    {
      id: 'txn-2',
      date: new Date('2024-01-14'),
      description: 'Supplier Payment - Steel Corp',
      amount: 28500,
      type: 'debit',
      accountName: 'Accounts Payable',
    },
    {
      id: 'txn-3',
      date: new Date('2024-01-14'),
      description: 'Payroll Processing',
      amount: 125000,
      type: 'debit',
      accountName: 'Salaries and Wages',
    },
    {
      id: 'txn-4',
      date: new Date('2024-01-13'),
      description: 'Invoice #INV-2024-0125',
      amount: 67500,
      type: 'credit',
      accountName: 'Sales Revenue',
    },
    {
      id: 'txn-5',
      date: new Date('2024-01-12'),
      description: 'Utility Bill Payment',
      amount: 8500,
      type: 'debit',
      accountName: 'Rent and Utilities',
    },
  ],
  monthlyRevenue: [
    { month: 'Jan', amount: 825000 },
    { month: 'Feb', amount: 780000 },
    { month: 'Mar', amount: 892000 },
    { month: 'Apr', amount: 845000 },
    { month: 'May', amount: 923000 },
    { month: 'Jun', amount: 878000 },
    { month: 'Jul', amount: 912000 },
    { month: 'Aug', amount: 867000 },
    { month: 'Sep', amount: 945000 },
    { month: 'Oct', amount: 889000 },
    { month: 'Nov', amount: 934000 },
    { month: 'Dec', amount: 1035000 },
  ],
  monthlyExpenses: [
    { month: 'Jan', amount: 652000 },
    { month: 'Feb', amount: 618000 },
    { month: 'Mar', amount: 705000 },
    { month: 'Apr', amount: 668000 },
    { month: 'May', amount: 729000 },
    { month: 'Jun', amount: 694000 },
    { month: 'Jul', amount: 721000 },
    { month: 'Aug', amount: 686000 },
    { month: 'Sep', amount: 747000 },
    { month: 'Oct', amount: 702000 },
    { month: 'Nov', amount: 738000 },
    { month: 'Dec', amount: 895000 },
  ],
  topExpenseCategories: [
    { category: 'Cost of Goods Sold', amount: 5250000, percentage: 65.2 },
    { category: 'Salaries and Wages', amount: 1850000, percentage: 23.0 },
    { category: 'Rent and Utilities', amount: 420000, percentage: 5.2 },
    { category: 'Depreciation', amount: 350000, percentage: 4.3 },
    { category: 'Marketing', amount: 185000, percentage: 2.3 },
  ],
};

// ============================================================================
// Finance Service
// ============================================================================

export class FinanceService {
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

  // Dashboard Statistics
  static async getDashboardStats(): Promise<FinanceDashboardStats> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { ...MOCK_DASHBOARD_STATS };
    }
    return this.request<FinanceDashboardStats>('/finance/dashboard-stats');
  }

  // Chart of Accounts Methods
  static async getChartOfAccounts(filters?: {
    type?: AccountType;
    status?: AccountStatus;
    search?: string;
  }): Promise<Account[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredAccounts = [...MOCK_ACCOUNTS];

      if (filters?.type) {
        filteredAccounts = filteredAccounts.filter((a) => a.type === filters.type);
      }
      if (filters?.status) {
        filteredAccounts = filteredAccounts.filter((a) => a.status === filters.status);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAccounts = filteredAccounts.filter(
          (a) =>
            a.name.toLowerCase().includes(searchLower) ||
            a.code.toLowerCase().includes(searchLower) ||
            a.description?.toLowerCase().includes(searchLower)
        );
      }

      return filteredAccounts;
    }

    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.set('type', filters.type);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.search) queryParams.set('search', filters.search);

    return this.request<Account[]>(`/finance/chart-of-accounts?${queryParams.toString()}`);
  }

  static async getAccountById(id: string): Promise<Account> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const account = MOCK_ACCOUNTS.find((a) => a.id === id);
      if (!account) throw new Error('Account not found');
      return account;
    }
    return this.request<Account>(`/finance/chart-of-accounts/${id}`);
  }

  static async getAccountByCode(code: string): Promise<Account> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const account = MOCK_ACCOUNTS.find((a) => a.code === code);
      if (!account) throw new Error('Account not found');
      return account;
    }
    return this.request<Account>(`/finance/chart-of-accounts/code/${code}`);
  }

  static async getAccountsByType(type: AccountType): Promise<Account[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_ACCOUNTS.filter((a) => a.type === type);
    }
    return this.request<Account[]>(`/finance/chart-of-accounts/type/${type}`);
  }

  static async createAccount(data: CreateAccountDto): Promise<Account> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newAccount: Account = {
        id: `acc-${Date.now()}`,
        ...data,
        balance: 0,
        currency: data.currency || 'USD',
        isReconcilable: data.isReconcilable ?? true,
        isBankAccount: data.isBankAccount ?? false,
        status: AccountStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_ACCOUNTS.push(newAccount);
      return newAccount;
    }
    return this.request<Account>('/finance/chart-of-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateAccount(id: string, data: UpdateAccountDto): Promise<Account> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_ACCOUNTS.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Account not found');

      MOCK_ACCOUNTS[index] = {
        ...MOCK_ACCOUNTS[index],
        ...data,
        updatedAt: new Date(),
      };
      return MOCK_ACCOUNTS[index];
    }
    return this.request<Account>(`/finance/chart-of-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteAccount(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_ACCOUNTS.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Account not found');
      MOCK_ACCOUNTS.splice(index, 1);
      return;
    }
    await this.request<void>(`/finance/chart-of-accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Hierarchical Chart of Accounts
  static async getChartOfAccountsTree(): Promise<Account[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Build tree structure
      const accountMap = new Map<string, Account>();
      const roots: Account[] = [];

      // First pass: create map of all accounts
      MOCK_ACCOUNTS.forEach((account) => {
        accountMap.set(account.id, { ...account, children: [] });
      });

      // Second pass: build tree
      accountMap.forEach((account) => {
        if (account.parentId) {
          const parent = accountMap.get(account.parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(account);
          }
        } else {
          roots.push(account);
        }
      });

      return roots;
    }
    return this.request<Account[]>('/finance/chart-of-accounts/tree');
  }

  // Bank Reconciliation
  static async getBankReconciliations(bankAccountId: string): Promise<BankReconciliation[]> {
    return this.request<BankReconciliation[]>(`/finance/reconciliation/account/${bankAccountId}`);
  }

  static async getReconciliation(id: string): Promise<BankReconciliation> {
    return this.request<BankReconciliation>(`/finance/reconciliation/${id}`);
  }

  static async startReconciliation(data: {
    bankAccountId: string;
    periodStart: string;
    periodEnd: string;
    createdBy: string;
  }): Promise<BankReconciliation> {
    return this.request<BankReconciliation>('/finance/reconciliation/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async importBankStatement(bankAccountId: string, transactions: any[]): Promise<any> {
    return this.request('/finance/reconciliation/import', {
      method: 'POST',
      body: JSON.stringify({ bankAccountId, transactions }),
    });
  }

  static async runAutoMatch(reconciliationId: string): Promise<any> {
    return this.request(`/finance/reconciliation/${reconciliationId}/auto-match`, {
      method: 'POST',
    });
  }

  static async manualMatch(data: {
    reconciliationId: string;
    bankStatementId: string;
    generalLedgerId: string;
    matchType: string;
  }): Promise<any> {
    return this.request('/finance/reconciliation/manual-match', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Statutory Reporting
  static async getStatutoryComplianceReport(params: {
    companyId: string;
    reportType: 'GST' | 'TDS';
    startDate: string;
    endDate: string;
  }): Promise<StatutoryComplianceReport> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        companyId: params.companyId,
        reportType: `${params.reportType} Liability Report`,
        period: { startDate: params.startDate, endDate: params.endDate },
        totalLiability: params.reportType === 'GST' ? 125000 : 45000,
        transactions: 156,
        isCompliant: true,
        generatedAt: new Date(),
      };
    }
    return this.request<StatutoryComplianceReport>(`/finance/reports/statutory?${new URLSearchParams(params).toString()}`);
  }

  // Financial Reports
  // Backend returns an envelope: { reportType, data: [...], generatedAt }.
  // Returns the raw `data` array (may be empty) for the caller to transform.
  static async getTrialBalanceReport(params?: {
    periodId?: string;
    asOfDate?: string;
    includeZeroBalances?: boolean;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.periodId) queryParams.set('periodId', params.periodId);
    if (params?.asOfDate) queryParams.set('asOfDate', params.asOfDate);
    if (params?.includeZeroBalances) queryParams.set('includeZeroBalances', 'true');
    const qs = queryParams.toString();
    const res = await this.request<any>(`/finance/reports/trial-balance${qs ? `?${qs}` : ''}`);
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  }

  // Receivables Aging (analytics — aggregates existing invoices, no new table)
  // Backend envelope: { reportType, asOfDate, data: [...], summary, generatedAt }.
  static async getReceivablesAging(params?: {
    asOfDate?: string;
    partyId?: string;
  }): Promise<{ data: any[]; summary: any }> {
    const queryParams = new URLSearchParams();
    if (params?.asOfDate) queryParams.set('asOfDate', params.asOfDate);
    if (params?.partyId) queryParams.set('partyId', params.partyId);
    const qs = queryParams.toString();
    const res = await this.request<any>(
      `/finance/reports/receivables-aging${qs ? `?${qs}` : ''}`,
    );
    return {
      data: Array.isArray(res?.data) ? res.data : [],
      summary: res?.summary ?? null,
    };
  }

  // Job Cost Sheets (config/tracking list — backed by job_cost_sheets table)
  static async getJobCostSheets(filters?: {
    status?: string;
    projectType?: string;
    search?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (filters?.status && filters.status !== 'All') queryParams.set('status', filters.status);
    if (filters?.projectType && filters.projectType !== 'All') queryParams.set('projectType', filters.projectType);
    if (filters?.search) queryParams.set('search', filters.search);
    const qs = queryParams.toString();
    return this.request<any[]>(`/finance/cost-sheets${qs ? `?${qs}` : ''}`);
  }

  static async getJobCostSheet(id: string): Promise<any> {
    return this.request<any>(`/finance/cost-sheets/${id}`);
  }

  static async createJobCostSheet(data: any): Promise<any> {
    return this.request<any>('/finance/cost-sheets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateJobCostSheet(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/cost-sheets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteJobCostSheet(id: string): Promise<void> {
    await this.request<void>(`/finance/cost-sheets/${id}`, { method: 'DELETE' });
  }

  static async exportFinancialReport(params: {
    reportType: string;
    format: 'excel' | 'pdf';
    filters: any;
  }): Promise<{ downloadUrl: string }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        downloadUrl: `/api/finance/export/mock-report.${params.format === 'excel' ? 'xlsx' : 'pdf'}`,
      };
    }
    return this.request<{ downloadUrl: string }>('/finance/reports/export', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Budgets (finance/budgets)
  static async getBudgets(filters?: {
    status?: string;
    budgetType?: string;
    department?: string;
    search?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') q.set('status', filters.status);
    if (filters?.budgetType && filters.budgetType !== 'all') q.set('budgetType', filters.budgetType);
    if (filters?.department && filters.department !== 'all') q.set('department', filters.department);
    if (filters?.search) q.set('search', filters.search);
    const qs = q.toString();
    return this.request<any[]>(`/finance/budgets${qs ? `?${qs}` : ''}`);
  }

  static async getBudget(id: string): Promise<any> {
    return this.request<any>(`/finance/budgets/${id}`);
  }

  static async createBudget(data: any): Promise<any> {
    return this.request<any>('/finance/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateBudget(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteBudget(id: string): Promise<void> {
    await this.request<void>(`/finance/budgets/${id}`, { method: 'DELETE' });
  }

  // Fixed Assets (finance/fixed-assets)
  static async getFixedAssets(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') q.set('status', filters.status);
    if (filters?.category && filters.category !== 'all') q.set('category', filters.category);
    if (filters?.search) q.set('search', filters.search);
    const qs = q.toString();
    return this.request<any[]>(`/finance/fixed-assets${qs ? `?${qs}` : ''}`);
  }

  static async getFixedAssetsSummary(): Promise<any> {
    return this.request<any>('/finance/fixed-assets/summary');
  }

  static async getFixedAsset(id: string): Promise<any> {
    return this.request<any>(`/finance/fixed-assets/${id}`);
  }

  static async createFixedAsset(data: any): Promise<any> {
    return this.request<any>('/finance/fixed-assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateFixedAsset(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/fixed-assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteFixedAsset(id: string): Promise<void> {
    await this.request<void>(`/finance/fixed-assets/${id}`, { method: 'DELETE' });
  }

  // Cost Centers (finance/cost-centers)
  static async getCostCenters(filters?: {
    department?: string;
    isActive?: string;
    search?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.department && filters.department !== 'all') q.set('department', filters.department);
    if (filters?.isActive) q.set('isActive', filters.isActive);
    if (filters?.search) q.set('search', filters.search);
    const qs = q.toString();
    return this.request<any[]>(`/finance/cost-centers${qs ? `?${qs}` : ''}`);
  }

  static async getCostCenter(id: string): Promise<any> {
    return this.request<any>(`/finance/cost-centers/${id}`);
  }

  static async createCostCenter(data: any): Promise<any> {
    return this.request<any>('/finance/cost-centers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateCostCenter(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/cost-centers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteCostCenter(id: string): Promise<void> {
    await this.request<void>(`/finance/cost-centers/${id}`, { method: 'DELETE' });
  }

  // Tax Masters (finance/tax-masters)
  static async getTaxMasters(filters?: {
    taxType?: string;
    taxCategory?: string;
    isActive?: string;
    search?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.taxType && filters.taxType !== 'all') q.set('taxType', filters.taxType);
    if (filters?.taxCategory && filters.taxCategory !== 'all') q.set('taxCategory', filters.taxCategory);
    if (filters?.isActive) q.set('isActive', filters.isActive);
    if (filters?.search) q.set('search', filters.search);
    const qs = q.toString();
    return this.request<any[]>(`/finance/tax-masters${qs ? `?${qs}` : ''}`);
  }

  static async getTaxMaster(id: string): Promise<any> {
    return this.request<any>(`/finance/tax-masters/${id}`);
  }

  static async createTaxMaster(data: any): Promise<any> {
    return this.request<any>('/finance/tax-masters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateTaxMaster(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/tax-masters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteTaxMaster(id: string): Promise<void> {
    await this.request<void>(`/finance/tax-masters/${id}`, { method: 'DELETE' });
  }

  // Cash dashboard analytics (finance/cash)
  static async getCashDashboard(): Promise<any> {
    return this.request<any>('/finance/cash/dashboard');
  }
}

// Export singleton instance
export const financeService = FinanceService;
