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
// Integration & expense-claim types
// ============================================================================

export interface FinanceIntegration {
  id: string;
  name: string;
  type: string;
  provider?: string | null;
  status: string;
  connectionType?: string;
  connection_type?: string;
  frequency?: string;
  lastSync?: string | null;
  last_sync?: string | null;
  nextSync?: string | null;
  next_sync?: string | null;
  dataFlow?: string;
  data_flow?: string;
  version?: string | null;
  endpoint?: string | null;
}

export interface ExpenseClaimDetail {
  id: string;
  claimNumber?: string;
  employeeId?: string;
  employeeName?: string;
  claimDate?: string;
  totalAmount?: number | string;
  category?: string;
  description?: string;
  status?: string;
  approvedBy?: string | null;
  approvedDate?: string | null;
  paidDate?: string | null;
  paidBy?: string | null;
  paymentReference?: string | null;
  rejectionReason?: string | null;
}

// ============================================================================
// Finance Service
// ============================================================================

export class FinanceService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
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

  // Fixed-asset depreciation
  static async runDepreciation(): Promise<{
    processed: number;
    skipped: number;
    totalDepreciation: number;
    runDate: string;
  }> {
    return this.request('/finance/fixed-assets/depreciation/run', { method: 'POST' });
  }

  static async manualDepreciationEntry(
    assetCode: string,
    amount: number,
  ): Promise<any> {
    return this.request('/finance/fixed-assets/depreciation/manual-entry', {
      method: 'POST',
      body: JSON.stringify({ assetCode, amount }),
    });
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

  // --------------------------------------------------------------------------
  // Live bank-reconciliation endpoints (accounts module — /api/accounts/reconciliation)
  // These back the reconciliation workbench page. Envelopes: { success, data }.
  // --------------------------------------------------------------------------
  static async getUnreconciledBankTransactions(bankAccountId: string): Promise<any[]> {
    const res = await this.request<any>(
      `/api/accounts/reconciliation/unreconciled/${bankAccountId}`,
    );
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  static async autoMatchBankAccount(bankAccountId: string): Promise<{ matched: number }> {
    const res = await this.request<any>(
      `/api/accounts/reconciliation/auto-match/${bankAccountId}`,
      { method: 'POST' },
    );
    const matched = res?.data?.matched ?? res?.matched ?? 0;
    return { matched };
  }

  static async matchBankTransaction(data: {
    transactionId: string;
    journalEntryId: string;
  }): Promise<any> {
    return this.request('/api/accounts/reconciliation/match', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getReconciliationReport(
    bankAccountId: string,
    month?: string,
  ): Promise<any> {
    const q = month ? `?month=${encodeURIComponent(month)}` : '';
    const res = await this.request<any>(
      `/api/accounts/reconciliation/report/${bankAccountId}${q}`,
    );
    return res?.data ?? res;
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

  // Payables Aging (analytics — envelope: { data:[], summary })
  static async getPayablesAging(params?: {
    asOfDate?: string;
    partyId?: string;
  }): Promise<{ data: any[]; summary: any }> {
    const q = new URLSearchParams();
    if (params?.asOfDate) q.set('asOfDate', params.asOfDate);
    if (params?.partyId) q.set('partyId', params.partyId);
    const qs = q.toString();
    const res = await this.request<any>(
      `/finance/reports/payables-aging${qs ? `?${qs}` : ''}`,
    );
    return {
      data: Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [],
      summary: res?.summary ?? null,
    };
  }

  // Cash Flow report (analytics — envelope: { reportType, data:[], generatedAt })
  static async getCashFlowReport(params?: {
    periodId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.periodId) q.set('periodId', params.periodId);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    const qs = q.toString();
    return this.request<any>(`/finance/reports/cash-flow${qs ? `?${qs}` : ''}`);
  }

  // Receivables (AR customer accounts) list
  static async getReceivables(filters?: {
    status?: string;
    riskRating?: string;
    search?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') q.set('status', filters.status);
    if (filters?.riskRating && filters.riskRating !== 'all') q.set('riskRating', filters.riskRating);
    if (filters?.search) q.set('search', filters.search);
    const qs = q.toString();
    const res = await this.request<any>(`/finance/receivables${qs ? `?${qs}` : ''}`);
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  // Account ledger transactions (chart-of-accounts/:id/transactions)
  // Backend envelope: { accountId, accountCode, accountName, transactions:[], summary }.
  static async getAccountTransactions(id: string): Promise<any> {
    return this.request<any>(`/finance/chart-of-accounts/${id}/transactions`);
  }

  // Journal Entries (accounting) detail pages
  static async getJournalEntries(): Promise<any[]> {
    const res = await this.request<any>('/finance/journal-entries');
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  static async getJournalEntry(id: string): Promise<any> {
    return this.request<any>(`/finance/journal-entries/${id}`);
  }

  static async createJournalEntry(data: any): Promise<any> {
    return this.request<any>('/finance/journal-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateJournalEntry(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/journal-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Invoices list (finance/invoices) — supports invoiceType/status/party filters
  static async getInvoices(filters?: {
    invoiceType?: string;
    status?: string;
    partyId?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.invoiceType) q.set('invoiceType', filters.invoiceType);
    if (filters?.status) q.set('status', filters.status);
    if (filters?.partyId) q.set('partyId', filters.partyId);
    const qs = q.toString();
    const res = await this.request<any>(`/finance/invoices${qs ? `?${qs}` : ''}`);
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  // Invoices detail pages
  static async getInvoice(id: string): Promise<any> {
    return this.request<any>(`/finance/invoices/${id}`);
  }

  static async deleteInvoice(id: string): Promise<void> {
    await this.request<void>(`/finance/invoices/${id}`, { method: 'DELETE' });
  }

  // Payables (AP vendor accounts) list
  static async getPayables(filters?: {
    status?: string;
    search?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') q.set('status', filters.status);
    if (filters?.search) q.set('search', filters.search);
    const qs = q.toString();
    const res = await this.request<any>(`/finance/payables${qs ? `?${qs}` : ''}`);
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  // Payments detail pages
  static async getPayments(): Promise<any[]> {
    const res = await this.request<any>('/finance/payments');
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  static async getPayment(id: string): Promise<any> {
    return this.request<any>(`/finance/payments/${id}`);
  }

  // Export the Profit & Loss statement as a PDF or Excel document (Blob).
  static async exportProfitLoss(
    format: 'pdf' | 'excel',
    params?: { startDate?: string; endDate?: string; periodId?: string },
  ): Promise<Blob> {
    const qs = new URLSearchParams();
    if (params?.startDate) qs.set('startDate', params.startDate);
    if (params?.endDate) qs.set('endDate', params.endDate);
    if (params?.periodId) qs.set('periodId', params.periodId);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.downloadBlob(`/finance/profit-loss/export/${format}${suffix}`);
  }

  // Payment activity timeline (audit-derived from payment status columns).
  static async getPaymentActivity(id: string): Promise<any[]> {
    const res = await this.request<any>(`/finance/payments/${id}/activity`);
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  // AP vendor accounts (used as the vendor lookup source for payables).
  static async getVendorAccounts(): Promise<any[]> {
    const res = await this.request<any>('/finance/payables');
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  // AR customer accounts (used as the customer lookup source for receivables).
  static async getCustomerAccounts(): Promise<any[]> {
    const res = await this.request<any>('/finance/receivables');
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  static async createPayment(data: any): Promise<any> {
    return this.request<any>('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updatePayment(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Receivables (AR customer accounts) create
  static async createReceivable(data: any): Promise<any> {
    return this.request<any>('/finance/receivables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Receivables (AR customer accounts) detail pages
  static async getReceivable(id: string): Promise<any> {
    return this.request<any>(`/finance/receivables/${id}`);
  }

  static async updateReceivable(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/receivables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Payables (AP vendor accounts) create
  static async createPayable(data: any): Promise<any> {
    return this.request<any>('/finance/payables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payables (AP vendor accounts) detail pages
  static async getPayable(id: string): Promise<any> {
    return this.request<any>(`/finance/payables/${id}`);
  }

  static async updatePayable(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/payables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Advanced features (settings / feature toggles)
  static async getAdvancedFeatures(): Promise<any[]> {
    const res = await this.request<any>('/finance/advanced-features');
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  static async createAdvancedFeature(data: any): Promise<any> {
    return this.request<any>('/finance/advanced-features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateAdvancedFeature(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/advanced-features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==========================================================================
  // Reports (reuse existing finance/reports/* aggregation endpoints)
  // ==========================================================================
  private static toArray(res: any): any[] {
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  static async getFinancialRatios(params?: { periodId?: string; asOfDate?: string }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.periodId) q.set('periodId', params.periodId);
    if (params?.asOfDate) q.set('asOfDate', params.asOfDate);
    return this.request<any>(`/finance/reports/financial-ratios?${q.toString()}`);
  }

  static async getGeneralLedgerReport(params?: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    periodId?: string;
  }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.accountId) q.set('accountId', params.accountId);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    if (params?.periodId) q.set('periodId', params.periodId);
    return this.request<any>(`/finance/reports/general-ledger-report?${q.toString()}`);
  }

  static async getProfitLoss(params?: { startDate?: string; endDate?: string; periodId?: string }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    if (params?.periodId) q.set('periodId', params.periodId);
    return this.request<any>(`/finance/reports/profit-loss?${q.toString()}`);
  }

  static async getBalanceSheet(asOfDate: string): Promise<any> {
    return this.request<any>(`/finance/reports/balance-sheet?asOfDate=${encodeURIComponent(asOfDate)}`);
  }

  static async getAdvancedDashboard(): Promise<any> {
    return this.request<any>('/finance/advanced/dashboard');
  }

  // ==========================================================================
  // Costing operations (standard costs, variance, WIP, profit centers)
  // ==========================================================================
  static async getStandardCosts(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/standard-costs'));
  }
  static async getStandardCost(id: string): Promise<any> {
    return this.request<any>(`/finance/standard-costs/${id}`);
  }
  static async createStandardCost(data: any): Promise<any> {
    return this.request<any>('/finance/standard-costs', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateStandardCost(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/standard-costs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteStandardCost(id: string): Promise<void> {
    await this.request<any>(`/finance/standard-costs/${id}`, { method: 'DELETE' });
  }

  static async getVarianceAnalysis(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/variance-analysis'));
  }
  static async getVariance(id: string): Promise<any> {
    return this.request<any>(`/finance/variance-analysis/${id}`);
  }
  static async createVariance(data: any): Promise<any> {
    return this.request<any>('/finance/variance-analysis', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateVariance(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/variance-analysis/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteVariance(id: string): Promise<void> {
    await this.request<any>(`/finance/variance-analysis/${id}`, { method: 'DELETE' });
  }

  static async getWipAccounting(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/wip-accounting'));
  }
  static async getWip(id: string): Promise<any> {
    return this.request<any>(`/finance/wip-accounting/${id}`);
  }
  static async createWip(data: any): Promise<any> {
    return this.request<any>('/finance/wip-accounting', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateWip(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/wip-accounting/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteWip(id: string): Promise<void> {
    await this.request<any>(`/finance/wip-accounting/${id}`, { method: 'DELETE' });
  }

  static async getProfitCenters(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/profit-centers'));
  }

  // ==========================================================================
  // Anticipated cash (receipts / payments)
  // ==========================================================================
  static async getAnticipatedReceipts(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/anticipated-receipts'));
  }
  static async createAnticipatedReceipt(data: any): Promise<any> {
    return this.request<any>('/finance/anticipated-receipts', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateAnticipatedReceipt(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/anticipated-receipts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteAnticipatedReceipt(id: string): Promise<void> {
    await this.request<any>(`/finance/anticipated-receipts/${id}`, { method: 'DELETE' });
  }

  static async getAnticipatedPayments(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/anticipated-payments'));
  }
  static async createAnticipatedPayment(data: any): Promise<any> {
    return this.request<any>('/finance/anticipated-payments', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateAnticipatedPayment(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/anticipated-payments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteAnticipatedPayment(id: string): Promise<void> {
    await this.request<any>(`/finance/anticipated-payments/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // Financial years / periods
  // ==========================================================================
  static async getFinancialYears(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/financial-years'));
  }
  static async createFinancialYear(data: any): Promise<any> {
    return this.request<any>('/finance/financial-years', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateFinancialYear(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/financial-years/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async getFinancialPeriods(financialYearId?: string): Promise<any[]> {
    const q = financialYearId ? `?financialYearId=${financialYearId}` : '';
    return this.toArray(await this.request<any>(`/finance/financial-periods${q}`));
  }
  static async createFinancialPeriod(data: any): Promise<any> {
    return this.request<any>('/finance/financial-periods', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateFinancialPeriod(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/financial-periods/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // ==========================================================================
  // Consolidation / intercompany
  // ==========================================================================
  static async getConsolidation(): Promise<any> {
    return this.request<any>('/finance/consolidation');
  }
  static async getIntercompany(): Promise<any> {
    return this.request<any>('/finance/intercompany');
  }

  // ==========================================================================
  // Exchange rates / multi-currency
  // ==========================================================================
  static async getExchangeRates(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/exchange-rates'));
  }
  static async createExchangeRate(data: any): Promise<any> {
    return this.request<any>('/finance/exchange-rates', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateExchangeRate(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/exchange-rates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteExchangeRate(id: string): Promise<void> {
    await this.request<any>(`/finance/exchange-rates/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // Automation: recurring transactions, workflows, alerts
  // ==========================================================================
  static async getRecurringTransactions(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/recurring-transactions'));
  }
  static async createRecurringTransaction(data: any): Promise<any> {
    return this.request<any>('/finance/recurring-transactions', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateRecurringTransaction(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/recurring-transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteRecurringTransaction(id: string): Promise<void> {
    await this.request<any>(`/finance/recurring-transactions/${id}`, { method: 'DELETE' });
  }

  static async getApprovalWorkflows(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/approval-workflows'));
  }
  static async createApprovalWorkflow(data: any): Promise<any> {
    return this.request<any>('/finance/approval-workflows', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateApprovalWorkflow(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/approval-workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteApprovalWorkflow(id: string): Promise<void> {
    await this.request<any>(`/finance/approval-workflows/${id}`, { method: 'DELETE' });
  }

  static async getAlerts(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/alerts'));
  }
  static async createAlert(data: any): Promise<any> {
    return this.request<any>('/finance/alerts', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateAlert(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteAlert(id: string): Promise<void> {
    await this.request<any>(`/finance/alerts/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // Controls: documents, audit-trail
  // ==========================================================================
  static async getDocuments(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/documents'));
  }
  static async createDocument(data: any): Promise<any> {
    return this.request<any>('/finance/documents', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateDocument(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteDocument(id: string): Promise<void> {
    await this.request<any>(`/finance/documents/${id}`, { method: 'DELETE' });
  }

  static async getAuditTrail(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/audit-trail'));
  }

  // ==========================================================================
  // Receivables: credit management
  // ==========================================================================
  static async getCreditLimits(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/credit-limits'));
  }
  static async createCreditLimit(data: any): Promise<any> {
    return this.request<any>('/finance/credit-limits', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateCreditLimit(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/credit-limits/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteCreditLimit(id: string): Promise<void> {
    await this.request<any>(`/finance/credit-limits/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // Investments
  // ==========================================================================
  static async getInvestments(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/investments'));
  }
  static async createInvestment(data: any): Promise<any> {
    return this.request<any>('/finance/investments', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateInvestment(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteInvestment(id: string): Promise<void> {
    await this.request<any>(`/finance/investments/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // Report builder templates
  // ==========================================================================
  static async getReportTemplates(): Promise<any[]> {
    return this.toArray(await this.request<any>('/finance/report-templates'));
  }
  static async createReportTemplate(data: any): Promise<any> {
    return this.request<any>('/finance/report-templates', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateReportTemplate(id: string, data: any): Promise<any> {
    return this.request<any>(`/finance/report-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteReportTemplate(id: string): Promise<void> {
    await this.request<any>(`/finance/report-templates/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // Financial integrations (external system configs / status)
  // ==========================================================================
  static async getIntegrations(): Promise<FinanceIntegration[]> {
    return this.toArray(await this.request<any>('/finance/integrations'));
  }
  static async getIntegration(id: string): Promise<FinanceIntegration> {
    return this.request<FinanceIntegration>(`/finance/integrations/${id}`);
  }

  // ==========================================================================
  // Statutory: GST returns (record/import GSTR-2A, file GSTR-1/3B, download doc)
  // ==========================================================================
  private static async downloadBlob(
    endpoint: string,
    options?: RequestInit,
  ): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers: { ...(options?.headers ?? {}) },
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.blob();
  }

  static async getGstReturns(filters?: {
    returnType?: string;
    period?: string;
    status?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.returnType) q.set('returnType', filters.returnType);
    if (filters?.period) q.set('period', filters.period);
    if (filters?.status) q.set('status', filters.status);
    const qs = q.toString();
    return this.toArray(await this.request<any>(`/finance/gst/returns${qs ? `?${qs}` : ''}`));
  }

  static async importGstr2a(data: {
    period: string;
    rows: any[];
    notes?: string;
  }): Promise<any> {
    return this.request<any>('/finance/gst/gstr-2a/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async fileGstReturn(data: {
    returnType: string;
    period: string;
    dueDate?: string;
    totalSales?: number;
    totalPurchases?: number;
    outputTax?: number;
    inputTax?: number;
    netTax?: number;
    rows?: any[];
  }): Promise<any> {
    return this.request<any>('/finance/gst/returns/file', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async downloadGstReturn(
    id: string,
    format: 'pdf' | 'excel' = 'pdf',
  ): Promise<Blob> {
    return this.downloadBlob(`/finance/gst/returns/${id}/download?format=${format}`);
  }

  // ==========================================================================
  // Statutory: TDS returns + challans + Form-16A
  // ==========================================================================
  static async getTdsReturns(filters?: {
    formType?: string;
    quarter?: string;
    status?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.formType) q.set('formType', filters.formType);
    if (filters?.quarter) q.set('quarter', filters.quarter);
    if (filters?.status) q.set('status', filters.status);
    const qs = q.toString();
    return this.toArray(await this.request<any>(`/finance/tds/returns${qs ? `?${qs}` : ''}`));
  }

  static async fileTdsReturn(data: {
    formType: string;
    quarter: string;
    dueDate?: string;
    totalDeductions?: number;
    totalDeposited?: number;
    deducteeCount?: number;
    rows?: any[];
  }): Promise<any> {
    return this.request<any>('/finance/tds/returns/file', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async downloadTdsReturn(
    id: string,
    format: 'pdf' | 'excel' = 'pdf',
  ): Promise<Blob> {
    return this.downloadBlob(`/finance/tds/returns/${id}/download?format=${format}`);
  }

  static async getTdsChallans(filters?: {
    section?: string;
    quarter?: string;
    status?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams();
    if (filters?.section) q.set('section', filters.section);
    if (filters?.quarter) q.set('quarter', filters.quarter);
    if (filters?.status) q.set('status', filters.status);
    const qs = q.toString();
    return this.toArray(await this.request<any>(`/finance/tds/challans${qs ? `?${qs}` : ''}`));
  }

  static async createTdsChallan(data: {
    challanNumber?: string;
    challanDate?: string;
    amount: number;
    section: string;
    bankName?: string;
    bsrCode?: string;
    quarter?: string;
  }): Promise<any> {
    return this.request<any>('/finance/tds/challans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async downloadTdsChallan(
    id: string,
    format: 'pdf' | 'excel' = 'pdf',
  ): Promise<Blob> {
    return this.downloadBlob(`/finance/tds/challans/${id}/download?format=${format}`);
  }

  static async generateForm16a(data: {
    deducteeName: string;
    deducteePAN: string;
    deductorName?: string;
    deductorTAN?: string;
    section?: string;
    paymentDate?: string;
    grossAmount?: number;
    tdsRate?: number;
    tdsAmount?: number;
    challanNumber?: string;
    challanDate?: string;
    bsrCode?: string;
    quarter?: string;
  }): Promise<Blob> {
    return this.downloadBlob('/finance/tds/form-16a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // ==========================================================================
  // Period-close checklist (per financial period)
  // ==========================================================================
  static async getPeriodCloseChecklist(periodId: string): Promise<any> {
    return this.request<any>(`/finance/period-close/${periodId}/checklist`);
  }

  static async updatePeriodCloseStep(
    periodId: string,
    stepKey: string,
    body: { status?: string; completedBy?: string; notes?: string },
  ): Promise<any> {
    return this.request<any>(`/finance/period-close/${periodId}/checklist/${stepKey}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // ==========================================================================
  // Chart of accounts: bulk import (parsed JSON rows)
  // ==========================================================================
  static async bulkImportAccounts(data: {
    accounts: any[];
    validateOnly?: boolean;
  }): Promise<any> {
    return this.request<any>('/finance/chart-of-accounts/bulk-import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==========================================================================
  // Bank accounts (accounts module — /api/accounts/banks). Envelope: { success, data }.
  // ==========================================================================
  static async getBankAccounts(): Promise<any[]> {
    const res = await this.request<any>('/api/accounts/banks');
    return this.toArray(res && typeof res === 'object' && 'data' in res ? res.data : res);
  }

  static async getBankAccount(id: string): Promise<any> {
    const res = await this.request<any>(`/api/accounts/banks/${id}`);
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async createBankAccount(payload: any): Promise<any> {
    const res = await this.request<any>('/api/accounts/banks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async updateBankAccount(id: string, payload: any): Promise<any> {
    const res = await this.request<any>(`/api/accounts/banks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async deleteBankAccount(id: string): Promise<void> {
    await this.request<any>(`/api/accounts/banks/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // Expense claims (reuses accounts module — GET /api/accounts/expense-claims/:id)
  // ==========================================================================
  static async getExpenseClaim(id: string): Promise<ExpenseClaimDetail> {
    const res = await this.request<any>(`/api/accounts/expense-claims/${id}`);
    // Controller wraps payload as { success, data }; unwrap defensively.
    return (res && typeof res === 'object' && 'data' in res ? res.data : res) as ExpenseClaimDetail;
  }

  // ==========================================================================
  // Petty cash (accounts module — /api/accounts/petty-cash). Envelope: { success, data }.
  // ==========================================================================
  static async getPettyCashTransactions(): Promise<any[]> {
    const res = await this.request<any>('/api/accounts/petty-cash');
    return this.toArray(res && typeof res === 'object' && 'data' in res ? res.data : res);
  }

  static async getPettyCashBalance(): Promise<number> {
    const res = await this.request<any>('/api/accounts/petty-cash/balance/total');
    const data = res && typeof res === 'object' && 'data' in res ? res.data : res;
    // Balance may arrive as { total } / { balance } / a bare number.
    const raw =
      data && typeof data === 'object'
        ? (data.total ?? data.balance ?? data.amount ?? 0)
        : data;
    return Number(raw) || 0;
  }

  static async createPettyCashTransaction(payload: any): Promise<any> {
    const res = await this.request<any>('/api/accounts/petty-cash', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async approvePettyCash(id: string): Promise<any> {
    const res = await this.request<any>(`/api/accounts/petty-cash/${id}/approve`, {
      method: 'POST',
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async rejectPettyCash(id: string): Promise<any> {
    const res = await this.request<any>(`/api/accounts/petty-cash/${id}/reject`, {
      method: 'POST',
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async replenishPettyCash(payload: any): Promise<any> {
    const res = await this.request<any>('/api/accounts/petty-cash/replenish', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  // ==========================================================================
  // Expense claims — list/create/submit/approve/reject (accounts module).
  // ==========================================================================
  static async getExpenseClaims(): Promise<any[]> {
    const res = await this.request<any>('/api/accounts/expense-claims');
    return this.toArray(res && typeof res === 'object' && 'data' in res ? res.data : res);
  }

  static async createExpenseClaim(payload: any): Promise<any> {
    const res = await this.request<any>('/api/accounts/expense-claims', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async submitExpenseClaim(id: string): Promise<any> {
    const res = await this.request<any>(`/api/accounts/expense-claims/${id}/submit`, {
      method: 'POST',
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async approveExpenseClaim(id: string): Promise<any> {
    const res = await this.request<any>(`/api/accounts/expense-claims/${id}/approve`, {
      method: 'POST',
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async rejectExpenseClaim(id: string): Promise<any> {
    const res = await this.request<any>(`/api/accounts/expense-claims/${id}/reject`, {
      method: 'POST',
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  // ==========================================================================
  // Payment lifecycle transitions (finance/payments). Envelope: { success, data }.
  // ==========================================================================
  static async reconcilePayment(id: string): Promise<any> {
    const res = await this.request<any>(`/finance/payments/${id}/reconcile`, {
      method: 'POST',
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async cancelPayment(id: string): Promise<any> {
    const res = await this.request<any>(`/finance/payments/${id}/cancel`, {
      method: 'POST',
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async refundPayment(
    id: string,
    payload?: { amount?: number; reason?: string },
  ): Promise<any> {
    const res = await this.request<any>(`/finance/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async markPaymentFailed(
    id: string,
    payload?: { reason?: string },
  ): Promise<any> {
    const res = await this.request<any>(`/finance/payments/${id}/mark-failed`, {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    });
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  static async getPaymentReceipt(id: string): Promise<any> {
    const res = await this.request<any>(`/finance/payments/${id}/receipt`);
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  }

  // ==========================================================================
  // Vendor accounts (Accounts Payable master) — @Controller('finance/payables')
  // (getVendorAccounts / getPayable already defined above)
  // ==========================================================================
  static async createVendorAccount(payload: any): Promise<any> {
    return this.request<any>('/finance/payables', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updateVendorAccount(id: string, payload: any): Promise<any> {
    return this.request<any>(`/finance/payables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async deleteVendorAccount(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/finance/payables/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // Intercompany transactions — @Controller('finance/intercompany-transactions')
  // ==========================================================================
  static async getIntercompanyTransactions(): Promise<any[]> {
    return this.request<any[]>('/finance/intercompany-transactions');
  }

  static async getIntercompanyTransaction(id: string): Promise<any> {
    return this.request<any>(`/finance/intercompany-transactions/${id}`);
  }

  static async createIntercompanyTransaction(payload: any): Promise<any> {
    return this.request<any>('/finance/intercompany-transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updateIntercompanyTransaction(id: string, payload: any): Promise<any> {
    return this.request<any>(`/finance/intercompany-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async deleteIntercompanyTransaction(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/finance/intercompany-transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // Cash transactions ledger — @Controller('finance/cash-transactions')
  // ==========================================================================
  static async getCashTransactions(): Promise<any[]> {
    return this.request<any[]>('/finance/cash-transactions');
  }

  static async createCashTransaction(payload: any): Promise<any> {
    return this.request<any>('/finance/cash-transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updateCashTransaction(id: string, payload: any): Promise<any> {
    return this.request<any>(`/finance/cash-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async deleteCashTransaction(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/finance/cash-transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // Currency master — @Controller('finance/currency-master')
  // ==========================================================================
  static async getCurrencies(): Promise<any[]> {
    return this.request<any[]>('/finance/currency-master');
  }

  static async createCurrency(payload: any): Promise<any> {
    return this.request<any>('/finance/currency-master', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updateCurrency(id: string, payload: any): Promise<any> {
    return this.request<any>(`/finance/currency-master/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async deleteCurrency(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/finance/currency-master/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // Collection activities — @Controller('finance/collection-activities')
  // ==========================================================================
  static async getCollectionActivities(receivableId?: string): Promise<any[]> {
    const qs = receivableId ? `?receivableId=${encodeURIComponent(receivableId)}` : '';
    return this.request<any[]>(`/finance/collection-activities${qs}`);
  }

  static async createCollectionActivity(payload: any): Promise<any> {
    return this.request<any>('/finance/collection-activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteCollectionActivity(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/finance/collection-activities/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // Payment reminders — @Controller('finance/reminders')
  // ==========================================================================
  static async getReminders(targetType?: string, targetId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (targetType) params.set('targetType', targetType);
    if (targetId) params.set('targetId', targetId);
    const qs = params.toString();
    return this.request<any[]>(`/finance/reminders${qs ? `?${qs}` : ''}`);
  }

  static async sendReminder(payload: {
    targetType: string;
    targetId: string;
    channel?: string;
    message?: string;
  }): Promise<any> {
    return this.request<any>('/finance/reminders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ==========================================================================
  // Forecast scenarios — @Controller('finance/forecast-scenarios')
  // ==========================================================================
  static async getForecastScenarios(): Promise<any[]> {
    return this.request<any[]>('/finance/forecast-scenarios');
  }

  static async createForecastScenario(payload: any): Promise<any> {
    return this.request<any>('/finance/forecast-scenarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updateForecastScenario(id: string, payload: any): Promise<any> {
    return this.request<any>(`/finance/forecast-scenarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async deleteForecastScenario(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/finance/forecast-scenarios/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const financeService = FinanceService;
