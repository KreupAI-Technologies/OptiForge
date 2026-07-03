/**
 * Financial Reports Service
 * Handles financial statements and reports generation
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Type Definitions
// ============================================================================

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  periodName?: string;
  fiscalYear?: number;
  fiscalPeriod?: number;
}

export interface ReportParams {
  startDate: Date;
  endDate: Date;
  comparePeriod?: boolean;
  compareStartDate?: Date;
  compareEndDate?: Date;
  currency?: string;
  format?: 'summary' | 'detailed';
}

// Balance Sheet Types
export interface BalanceSheetLineItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  balance: number;
  previousBalance?: number;
  variance?: number;
  variancePercent?: number;
  children?: BalanceSheetLineItem[];
}

export interface BalanceSheetSection {
  name: string;
  total: number;
  previousTotal?: number;
  variance?: number;
  variancePercent?: number;
  items: BalanceSheetLineItem[];
}

export interface BalanceSheet {
  reportDate: Date;
  periodEnd: Date;
  currency: string;
  assets: {
    currentAssets: BalanceSheetSection;
    nonCurrentAssets: BalanceSheetSection;
    totalAssets: number;
    previousTotalAssets?: number;
  };
  liabilities: {
    currentLiabilities: BalanceSheetSection;
    nonCurrentLiabilities: BalanceSheetSection;
    totalLiabilities: number;
    previousTotalLiabilities?: number;
  };
  equity: {
    section: BalanceSheetSection;
    totalEquity: number;
    previousTotalEquity?: number;
  };
  totalLiabilitiesAndEquity: number;
  previousTotalLiabilitiesAndEquity?: number;
  isBalanced: boolean;
}

// Profit & Loss Types
export interface ProfitLossLineItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  previousAmount?: number;
  variance?: number;
  variancePercent?: number;
  percentOfRevenue?: number;
  children?: ProfitLossLineItem[];
}

export interface ProfitLossSection {
  name: string;
  total: number;
  previousTotal?: number;
  variance?: number;
  variancePercent?: number;
  percentOfRevenue?: number;
  items: ProfitLossLineItem[];
}

export interface ProfitLoss {
  reportDate: Date;
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  revenue: ProfitLossSection;
  costOfGoodsSold: ProfitLossSection;
  grossProfit: number;
  previousGrossProfit?: number;
  grossMargin: number;
  operatingExpenses: ProfitLossSection;
  operatingIncome: number;
  previousOperatingIncome?: number;
  operatingMargin: number;
  otherIncomeExpenses: ProfitLossSection;
  incomeBeforeTax: number;
  previousIncomeBeforeTax?: number;
  taxExpense: number;
  previousTaxExpense?: number;
  netIncome: number;
  previousNetIncome?: number;
  netMargin: number;
  variance?: number;
  variancePercent?: number;
}

// Cash Flow Types
export enum CashFlowCategory {
  OPERATING = 'OPERATING',
  INVESTING = 'INVESTING',
  FINANCING = 'FINANCING',
}

export interface CashFlowLineItem {
  description: string;
  amount: number;
  previousAmount?: number;
  accountId?: string;
}

export interface CashFlowSection {
  category: CashFlowCategory;
  name: string;
  items: CashFlowLineItem[];
  netCashFlow: number;
  previousNetCashFlow?: number;
}

export interface CashFlow {
  reportDate: Date;
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  beginningCash: number;
  previousBeginningCash?: number;
  operatingActivities: CashFlowSection;
  investingActivities: CashFlowSection;
  financingActivities: CashFlowSection;
  netChangeInCash: number;
  previousNetChangeInCash?: number;
  endingCash: number;
  previousEndingCash?: number;
}

// Trial Balance Types
export interface TrialBalanceLineItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalance {
  reportDate: Date;
  asOfDate: Date;
  currency: string;
  accounts: TrialBalanceLineItem[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  variance: number;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_BALANCE_SHEET: BalanceSheet = {
  reportDate: new Date(),
  periodEnd: new Date('2024-01-31'),
  currency: 'USD',
  assets: {
    currentAssets: {
      name: 'Current Assets',
      total: 4580000,
      previousTotal: 4250000,
      variance: 330000,
      variancePercent: 7.76,
      items: [
        {
          accountId: 'acc-1',
          accountCode: '1000',
          accountName: 'Cash and Cash Equivalents',
          balance: 1855000,
          previousBalance: 1720000,
          variance: 135000,
          variancePercent: 7.85,
          children: [
            {
              accountId: 'acc-2',
              accountCode: '1100',
              accountName: 'Operating Bank Account',
              balance: 1850000,
              previousBalance: 1715000,
            },
            {
              accountId: 'acc-3',
              accountCode: '1200',
              accountName: 'Petty Cash',
              balance: 5000,
              previousBalance: 5000,
            },
          ],
        },
        {
          accountId: 'acc-4',
          accountCode: '1300',
          accountName: 'Accounts Receivable',
          balance: 875000,
          previousBalance: 820000,
          variance: 55000,
          variancePercent: 6.71,
        },
        {
          accountId: 'acc-5',
          accountCode: '1400',
          accountName: 'Inventory',
          balance: 1250000,
          previousBalance: 1180000,
          variance: 70000,
          variancePercent: 5.93,
        },
        {
          accountId: 'acc-24',
          accountCode: '1350',
          accountName: 'Prepaid Expenses',
          balance: 600000,
          previousBalance: 530000,
          variance: 70000,
          variancePercent: 13.21,
        },
      ],
    },
    nonCurrentAssets: {
      name: 'Non-Current Assets',
      total: 3150000,
      previousTotal: 3200000,
      variance: -50000,
      variancePercent: -1.56,
      items: [
        {
          accountId: 'acc-6',
          accountCode: '1500',
          accountName: 'Property, Plant & Equipment',
          balance: 3500000,
          previousBalance: 3500000,
          variance: 0,
          variancePercent: 0,
        },
        {
          accountId: 'acc-22',
          accountCode: '1550',
          accountName: 'Accumulated Depreciation',
          balance: -350000,
          previousBalance: -300000,
          variance: -50000,
          variancePercent: 16.67,
        },
      ],
    },
    totalAssets: 7730000,
    previousTotalAssets: 7450000,
  },
  liabilities: {
    currentLiabilities: {
      name: 'Current Liabilities',
      total: 810000,
      previousTotal: 780000,
      variance: 30000,
      variancePercent: 3.85,
      items: [
        {
          accountId: 'acc-7',
          accountCode: '2000',
          accountName: 'Accounts Payable',
          balance: 425000,
          previousBalance: 410000,
          variance: 15000,
          variancePercent: 3.66,
        },
        {
          accountId: 'acc-9',
          accountCode: '2200',
          accountName: 'Accrued Expenses',
          balance: 135000,
          previousBalance: 120000,
          variance: 15000,
          variancePercent: 12.5,
        },
        {
          accountId: 'acc-8',
          accountCode: '2100',
          accountName: 'Short-term Loans',
          balance: 250000,
          previousBalance: 250000,
          variance: 0,
          variancePercent: 0,
        },
      ],
    },
    nonCurrentLiabilities: {
      name: 'Non-Current Liabilities',
      total: 1500000,
      previousTotal: 1550000,
      variance: -50000,
      variancePercent: -3.23,
      items: [
        {
          accountId: 'acc-10',
          accountCode: '2300',
          accountName: 'Long-term Debt',
          balance: 1500000,
          previousBalance: 1550000,
          variance: -50000,
          variancePercent: -3.23,
        },
      ],
    },
    totalLiabilities: 2310000,
    previousTotalLiabilities: 2330000,
  },
  equity: {
    section: {
      name: 'Shareholders\' Equity',
      total: 5420000,
      previousTotal: 5120000,
      variance: 300000,
      variancePercent: 5.86,
      items: [
        {
          accountId: 'acc-11',
          accountCode: '3000',
          accountName: 'Common Stock',
          balance: 2000000,
          previousBalance: 2000000,
          variance: 0,
          variancePercent: 0,
        },
        {
          accountId: 'acc-12',
          accountCode: '3100',
          accountName: 'Retained Earnings',
          balance: 3420000,
          previousBalance: 3120000,
          variance: 300000,
          variancePercent: 9.62,
        },
      ],
    },
    totalEquity: 5420000,
    previousTotalEquity: 5120000,
  },
  totalLiabilitiesAndEquity: 7730000,
  previousTotalLiabilitiesAndEquity: 7450000,
  isBalanced: true,
};

const MOCK_PROFIT_LOSS: ProfitLoss = {
  reportDate: new Date(),
  periodStart: new Date('2024-01-01'),
  periodEnd: new Date('2024-01-31'),
  currency: 'USD',
  revenue: {
    name: 'Revenue',
    total: 1035000,
    previousTotal: 945000,
    variance: 90000,
    variancePercent: 9.52,
    percentOfRevenue: 100,
    items: [
      {
        accountId: 'acc-13',
        accountCode: '4000',
        accountName: 'Sales Revenue',
        amount: 895000,
        previousAmount: 820000,
        variance: 75000,
        variancePercent: 9.15,
        percentOfRevenue: 86.47,
      },
      {
        accountId: 'acc-14',
        accountCode: '4100',
        accountName: 'Service Revenue',
        amount: 125000,
        previousAmount: 110000,
        variance: 15000,
        variancePercent: 13.64,
        percentOfRevenue: 12.08,
      },
      {
        accountId: 'acc-15',
        accountCode: '4200',
        accountName: 'Other Income',
        amount: 15000,
        previousAmount: 15000,
        variance: 0,
        variancePercent: 0,
        percentOfRevenue: 1.45,
      },
    ],
  },
  costOfGoodsSold: {
    name: 'Cost of Goods Sold',
    total: 525000,
    previousTotal: 480000,
    variance: 45000,
    variancePercent: 9.38,
    percentOfRevenue: 50.72,
    items: [
      {
        accountId: 'acc-16',
        accountCode: '5000',
        accountName: 'Direct Materials',
        amount: 315000,
        previousAmount: 290000,
        variance: 25000,
        variancePercent: 8.62,
        percentOfRevenue: 30.43,
      },
      {
        accountId: 'acc-28',
        accountCode: '5010',
        accountName: 'Direct Labor',
        amount: 145000,
        previousAmount: 130000,
        variance: 15000,
        variancePercent: 11.54,
        percentOfRevenue: 14.01,
      },
      {
        accountId: 'acc-29',
        accountCode: '5020',
        accountName: 'Manufacturing Overhead',
        amount: 65000,
        previousAmount: 60000,
        variance: 5000,
        variancePercent: 8.33,
        percentOfRevenue: 6.28,
      },
    ],
  },
  grossProfit: 510000,
  previousGrossProfit: 465000,
  grossMargin: 49.28,
  operatingExpenses: {
    name: 'Operating Expenses',
    total: 285000,
    previousTotal: 265000,
    variance: 20000,
    variancePercent: 7.55,
    percentOfRevenue: 27.54,
    items: [
      {
        accountId: 'acc-17',
        accountCode: '5100',
        accountName: 'Salaries and Wages',
        amount: 155000,
        previousAmount: 145000,
        variance: 10000,
        variancePercent: 6.90,
        percentOfRevenue: 14.98,
      },
      {
        accountId: 'acc-18',
        accountCode: '5200',
        accountName: 'Rent and Utilities',
        amount: 42000,
        previousAmount: 40000,
        variance: 2000,
        variancePercent: 5.00,
        percentOfRevenue: 4.06,
      },
      {
        accountId: 'acc-19',
        accountCode: '5300',
        accountName: 'Marketing and Advertising',
        amount: 25000,
        previousAmount: 22000,
        variance: 3000,
        variancePercent: 13.64,
        percentOfRevenue: 2.42,
      },
      {
        accountId: 'acc-20',
        accountCode: '5400',
        accountName: 'Depreciation',
        amount: 29167,
        previousAmount: 29167,
        variance: 0,
        variancePercent: 0,
        percentOfRevenue: 2.82,
      },
      {
        accountId: 'acc-30',
        accountCode: '5450',
        accountName: 'Administrative Expenses',
        amount: 33833,
        previousAmount: 28833,
        variance: 5000,
        variancePercent: 17.34,
        percentOfRevenue: 3.27,
      },
    ],
  },
  operatingIncome: 225000,
  previousOperatingIncome: 200000,
  operatingMargin: 21.74,
  otherIncomeExpenses: {
    name: 'Other Income/Expenses',
    total: -5000,
    previousTotal: -5200,
    variance: 200,
    variancePercent: -3.85,
    percentOfRevenue: -0.48,
    items: [
      {
        accountId: 'acc-31',
        accountCode: '6000',
        accountName: 'Interest Income',
        amount: 2500,
        previousAmount: 2300,
        variance: 200,
        variancePercent: 8.70,
        percentOfRevenue: 0.24,
      },
      {
        accountId: 'acc-26',
        accountCode: '5600',
        accountName: 'Interest Expense',
        amount: -7500,
        previousAmount: -7500,
        variance: 0,
        variancePercent: 0,
        percentOfRevenue: -0.72,
      },
    ],
  },
  incomeBeforeTax: 220000,
  previousIncomeBeforeTax: 194800,
  taxExpense: 55000,
  previousTaxExpense: 48700,
  netIncome: 165000,
  previousNetIncome: 146100,
  netMargin: 15.94,
  variance: 18900,
  variancePercent: 12.93,
};

const MOCK_CASH_FLOW: CashFlow = {
  reportDate: new Date(),
  periodStart: new Date('2024-01-01'),
  periodEnd: new Date('2024-01-31'),
  currency: 'USD',
  beginningCash: 1720000,
  previousBeginningCash: 1580000,
  operatingActivities: {
    category: CashFlowCategory.OPERATING,
    name: 'Cash Flows from Operating Activities',
    items: [
      { description: 'Net Income', amount: 165000, previousAmount: 146100 },
      { description: 'Depreciation & Amortization', amount: 29167, previousAmount: 29167 },
      { description: 'Increase in Accounts Receivable', amount: -55000, previousAmount: -45000 },
      { description: 'Increase in Inventory', amount: -70000, previousAmount: -50000 },
      { description: 'Increase in Accounts Payable', amount: 15000, previousAmount: 12000 },
      { description: 'Increase in Accrued Expenses', amount: 15000, previousAmount: 8000 },
    ],
    netCashFlow: 99167,
    previousNetCashFlow: 100267,
  },
  investingActivities: {
    category: CashFlowCategory.INVESTING,
    name: 'Cash Flows from Investing Activities',
    items: [
      { description: 'Purchase of Equipment', amount: -25000, previousAmount: -35000 },
      { description: 'Sale of Equipment', amount: 5000, previousAmount: 0 },
    ],
    netCashFlow: -20000,
    previousNetCashFlow: -35000,
  },
  financingActivities: {
    category: CashFlowCategory.FINANCING,
    name: 'Cash Flows from Financing Activities',
    items: [
      { description: 'Repayment of Long-term Debt', amount: -50000, previousAmount: -50000 },
      { description: 'Dividends Paid', amount: 0, previousAmount: -25000 },
      { description: 'Proceeds from Short-term Borrowings', amount: 0, previousAmount: 100000 },
    ],
    netCashFlow: -50000,
    previousNetCashFlow: 25000,
  },
  netChangeInCash: 29167,
  previousNetChangeInCash: 90267,
  endingCash: 1749167,
  previousEndingCash: 1670267,
};

const MOCK_TRIAL_BALANCE: TrialBalance = {
  reportDate: new Date(),
  asOfDate: new Date('2024-01-31'),
  currency: 'USD',
  accounts: [
    // Assets
    { accountId: 'acc-2', accountCode: '1100', accountName: 'Operating Bank Account', accountType: 'ASSET', debit: 1850000, credit: 0, balance: 1850000 },
    { accountId: 'acc-3', accountCode: '1200', accountName: 'Petty Cash', accountType: 'ASSET', debit: 5000, credit: 0, balance: 5000 },
    { accountId: 'acc-4', accountCode: '1300', accountName: 'Accounts Receivable', accountType: 'ASSET', debit: 875000, credit: 0, balance: 875000 },
    { accountId: 'acc-24', accountCode: '1350', accountName: 'Prepaid Expenses', accountType: 'ASSET', debit: 600000, credit: 0, balance: 600000 },
    { accountId: 'acc-5', accountCode: '1400', accountName: 'Inventory', accountType: 'ASSET', debit: 1250000, credit: 0, balance: 1250000 },
    { accountId: 'acc-6', accountCode: '1500', accountName: 'Property, Plant & Equipment', accountType: 'ASSET', debit: 3500000, credit: 0, balance: 3500000 },
    { accountId: 'acc-22', accountCode: '1550', accountName: 'Accumulated Depreciation', accountType: 'ASSET', debit: 0, credit: 350000, balance: -350000 },
    // Liabilities
    { accountId: 'acc-7', accountCode: '2000', accountName: 'Accounts Payable', accountType: 'LIABILITY', debit: 0, credit: 425000, balance: -425000 },
    { accountId: 'acc-8', accountCode: '2100', accountName: 'Short-term Loans', accountType: 'LIABILITY', debit: 0, credit: 250000, balance: -250000 },
    { accountId: 'acc-9', accountCode: '2200', accountName: 'Accrued Expenses', accountType: 'LIABILITY', debit: 0, credit: 135000, balance: -135000 },
    { accountId: 'acc-10', accountCode: '2300', accountName: 'Long-term Debt', accountType: 'LIABILITY', debit: 0, credit: 1500000, balance: -1500000 },
    // Equity
    { accountId: 'acc-11', accountCode: '3000', accountName: 'Common Stock', accountType: 'EQUITY', debit: 0, credit: 2000000, balance: -2000000 },
    { accountId: 'acc-12', accountCode: '3100', accountName: 'Retained Earnings', accountType: 'EQUITY', debit: 0, credit: 3420000, balance: -3420000 },
    // Revenue
    { accountId: 'acc-13', accountCode: '4000', accountName: 'Sales Revenue', accountType: 'REVENUE', debit: 0, credit: 895000, balance: -895000 },
    { accountId: 'acc-14', accountCode: '4100', accountName: 'Service Revenue', accountType: 'REVENUE', debit: 0, credit: 125000, balance: -125000 },
    { accountId: 'acc-15', accountCode: '4200', accountName: 'Other Income', accountType: 'REVENUE', debit: 0, credit: 15000, balance: -15000 },
    // Expenses
    { accountId: 'acc-16', accountCode: '5000', accountName: 'Cost of Goods Sold', accountType: 'EXPENSE', debit: 525000, credit: 0, balance: 525000 },
    { accountId: 'acc-17', accountCode: '5100', accountName: 'Salaries and Wages', accountType: 'EXPENSE', debit: 155000, credit: 0, balance: 155000 },
    { accountId: 'acc-18', accountCode: '5200', accountName: 'Rent and Utilities', accountType: 'EXPENSE', debit: 42000, credit: 0, balance: 42000 },
    { accountId: 'acc-19', accountCode: '5300', accountName: 'Marketing and Advertising', accountType: 'EXPENSE', debit: 25000, credit: 0, balance: 25000 },
    { accountId: 'acc-20', accountCode: '5400', accountName: 'Depreciation', accountType: 'EXPENSE', debit: 29167, credit: 0, balance: 29167 },
    { accountId: 'acc-30', accountCode: '5450', accountName: 'Administrative Expenses', accountType: 'EXPENSE', debit: 33833, credit: 0, balance: 33833 },
    { accountId: 'acc-26', accountCode: '5600', accountName: 'Interest Expense', accountType: 'EXPENSE', debit: 7500, credit: 0, balance: 7500 },
    { accountId: 'acc-31', accountCode: '6000', accountName: 'Interest Income', accountType: 'REVENUE', debit: 0, credit: 2500, balance: -2500 },
    { accountId: 'acc-32', accountCode: '7000', accountName: 'Income Tax Expense', accountType: 'EXPENSE', debit: 55000, credit: 0, balance: 55000 },
  ],
  totalDebits: 8952500,
  totalCredits: 8952500,
  isBalanced: true,
  variance: 0,
};

// ============================================================================
// Financial Reports Service
// ============================================================================

export class FinancialReportsService {
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

  // Get Balance Sheet
  static async getBalanceSheet(params: ReportParams): Promise<BalanceSheet> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ...MOCK_BALANCE_SHEET,
        reportDate: new Date(),
        periodEnd: params.endDate,
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.set('startDate', params.startDate.toISOString());
    queryParams.set('endDate', params.endDate.toISOString());
    if (params.comparePeriod) queryParams.set('comparePeriod', 'true');
    if (params.compareStartDate) queryParams.set('compareStartDate', params.compareStartDate.toISOString());
    if (params.compareEndDate) queryParams.set('compareEndDate', params.compareEndDate.toISOString());
    if (params.currency) queryParams.set('currency', params.currency);
    if (params.format) queryParams.set('format', params.format);

    return this.request<BalanceSheet>(`/finance/balance-sheet?${queryParams.toString()}`);
  }

  // Get Profit & Loss Statement
  static async getProfitLoss(params: ReportParams): Promise<ProfitLoss> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ...MOCK_PROFIT_LOSS,
        reportDate: new Date(),
        periodStart: params.startDate,
        periodEnd: params.endDate,
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.set('startDate', params.startDate.toISOString());
    queryParams.set('endDate', params.endDate.toISOString());
    if (params.comparePeriod) queryParams.set('comparePeriod', 'true');
    if (params.compareStartDate) queryParams.set('compareStartDate', params.compareStartDate.toISOString());
    if (params.compareEndDate) queryParams.set('compareEndDate', params.compareEndDate.toISOString());
    if (params.currency) queryParams.set('currency', params.currency);
    if (params.format) queryParams.set('format', params.format);

    return this.request<ProfitLoss>(`/finance/profit-loss?${queryParams.toString()}`);
  }

  // Get Cash Flow Statement
  static async getCashFlow(params: ReportParams): Promise<CashFlow> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ...MOCK_CASH_FLOW,
        reportDate: new Date(),
        periodStart: params.startDate,
        periodEnd: params.endDate,
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.set('startDate', params.startDate.toISOString());
    queryParams.set('endDate', params.endDate.toISOString());
    if (params.comparePeriod) queryParams.set('comparePeriod', 'true');
    if (params.compareStartDate) queryParams.set('compareStartDate', params.compareStartDate.toISOString());
    if (params.compareEndDate) queryParams.set('compareEndDate', params.compareEndDate.toISOString());
    if (params.currency) queryParams.set('currency', params.currency);
    if (params.format) queryParams.set('format', params.format);

    return this.request<CashFlow>(`/finance/cash-flow?${queryParams.toString()}`);
  }

  // Get Trial Balance
  static async getTrialBalance(params: ReportParams): Promise<TrialBalance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      return {
        ...MOCK_TRIAL_BALANCE,
        reportDate: new Date(),
        asOfDate: params.endDate,
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.set('asOfDate', params.endDate.toISOString());
    if (params.currency) queryParams.set('currency', params.currency);
    if (params.format) queryParams.set('format', params.format);

    return this.request<TrialBalance>(`/finance/trial-balance?${queryParams.toString()}`);
  }

  // Get Report Periods (for period selectors)
  static async getReportPeriods(fiscalYear?: number): Promise<ReportPeriod[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const year = fiscalYear || new Date().getFullYear();
      const periods: ReportPeriod[] = [];

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        periods.push({
          startDate,
          endDate,
          periodName: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          fiscalYear: year,
          fiscalPeriod: month + 1,
        });
      }

      return periods;
    }

    const queryParams = new URLSearchParams();
    if (fiscalYear) queryParams.set('fiscalYear', fiscalYear.toString());

    return this.request<ReportPeriod[]>(`/finance/report-periods?${queryParams.toString()}`);
  }

  // Export Report to PDF
  static async exportToPdf(
    reportType: 'balance-sheet' | 'profit-loss' | 'cash-flow' | 'trial-balance',
    params: ReportParams
  ): Promise<Blob> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Return a mock blob (in real implementation, this would be actual PDF data)
      return new Blob(['Mock PDF content'], { type: 'application/pdf' });
    }

    const queryParams = new URLSearchParams();
    queryParams.set('startDate', params.startDate.toISOString());
    queryParams.set('endDate', params.endDate.toISOString());
    if (params.currency) queryParams.set('currency', params.currency);

    const response = await fetch(
      `${API_BASE_URL}/finance/${reportType}/export/pdf?${queryParams.toString()}`,
      {
        headers: {
          Accept: 'application/pdf',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Export Report to Excel
  static async exportToExcel(
    reportType: 'balance-sheet' | 'profit-loss' | 'cash-flow' | 'trial-balance',
    params: ReportParams
  ): Promise<Blob> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Return a mock blob (in real implementation, this would be actual Excel data)
      return new Blob(['Mock Excel content'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }

    const queryParams = new URLSearchParams();
    queryParams.set('startDate', params.startDate.toISOString());
    queryParams.set('endDate', params.endDate.toISOString());
    if (params.currency) queryParams.set('currency', params.currency);

    const response = await fetch(
      `${API_BASE_URL}/finance/${reportType}/export/excel?${queryParams.toString()}`,
      {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Get Financial Ratios
  static async getFinancialRatios(params: ReportParams): Promise<{
    liquidity: {
      currentRatio: number;
      quickRatio: number;
      cashRatio: number;
    };
    profitability: {
      grossMargin: number;
      operatingMargin: number;
      netMargin: number;
      returnOnAssets: number;
      returnOnEquity: number;
    };
    leverage: {
      debtToEquity: number;
      debtToAssets: number;
      interestCoverage: number;
    };
    efficiency: {
      assetTurnover: number;
      receivablesTurnover: number;
      inventoryTurnover: number;
      payablesTurnover: number;
    };
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      return {
        liquidity: {
          currentRatio: 5.65, // Current Assets / Current Liabilities
          quickRatio: 3.37, // (Current Assets - Inventory) / Current Liabilities
          cashRatio: 2.29, // Cash / Current Liabilities
        },
        profitability: {
          grossMargin: 49.28, // Gross Profit / Revenue
          operatingMargin: 21.74, // Operating Income / Revenue
          netMargin: 15.94, // Net Income / Revenue
          returnOnAssets: 2.13, // Net Income / Total Assets (annualized)
          returnOnEquity: 3.04, // Net Income / Total Equity (annualized)
        },
        leverage: {
          debtToEquity: 0.43, // Total Liabilities / Total Equity
          debtToAssets: 0.30, // Total Liabilities / Total Assets
          interestCoverage: 30.0, // Operating Income / Interest Expense
        },
        efficiency: {
          assetTurnover: 1.61, // Revenue / Average Assets (annualized)
          receivablesTurnover: 14.2, // Revenue / Average Receivables (annualized)
          inventoryTurnover: 5.04, // COGS / Average Inventory (annualized)
          payablesTurnover: 14.82, // COGS / Average Payables (annualized)
        },
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.set('startDate', params.startDate.toISOString());
    queryParams.set('endDate', params.endDate.toISOString());

    return this.request(`/finance/ratios?${queryParams.toString()}`);
  }

  // Get Budget vs Actual Comparison
  static async getBudgetVsActual(params: ReportParams): Promise<{
    periodStart: Date;
    periodEnd: Date;
    categories: {
      name: string;
      budget: number;
      actual: number;
      variance: number;
      variancePercent: number;
      status: 'on-track' | 'over-budget' | 'under-budget';
    }[];
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      return {
        periodStart: params.startDate,
        periodEnd: params.endDate,
        categories: [
          { name: 'Revenue', budget: 1000000, actual: 1035000, variance: 35000, variancePercent: 3.5, status: 'on-track' },
          { name: 'Cost of Goods Sold', budget: 500000, actual: 525000, variance: -25000, variancePercent: -5.0, status: 'over-budget' },
          { name: 'Salaries', budget: 160000, actual: 155000, variance: 5000, variancePercent: 3.1, status: 'under-budget' },
          { name: 'Rent & Utilities', budget: 45000, actual: 42000, variance: 3000, variancePercent: 6.7, status: 'under-budget' },
          { name: 'Marketing', budget: 30000, actual: 25000, variance: 5000, variancePercent: 16.7, status: 'under-budget' },
          { name: 'Administrative', budget: 35000, actual: 33833, variance: 1167, variancePercent: 3.3, status: 'under-budget' },
        ],
        totalBudget: 1770000,
        totalActual: 1815833,
        totalVariance: -45833,
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.set('startDate', params.startDate.toISOString());
    queryParams.set('endDate', params.endDate.toISOString());

    return this.request(`/finance/budget-vs-actual?${queryParams.toString()}`);
  }
}

// Export singleton instance
export const financialReportsService = FinancialReportsService;
