/**
 * Journal Service
 * Handles journal entries and general ledger operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Type Definitions
// ============================================================================

export enum JournalEntryType {
  STANDARD = 'STANDARD',
  ADJUSTING = 'ADJUSTING',
  CLOSING = 'CLOSING',
  REVERSING = 'REVERSING',
  OPENING = 'OPENING',
  RECURRING = 'RECURRING',
}

export enum JournalEntryStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
  CANCELLED = 'CANCELLED',
}

export enum JournalEntrySource {
  MANUAL = 'MANUAL',
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  PAYROLL = 'PAYROLL',
  DEPRECIATION = 'DEPRECIATION',
  INVENTORY = 'INVENTORY',
  ACCRUAL = 'ACCRUAL',
  SYSTEM = 'SYSTEM',
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description?: string;
  debit: number;
  credit: number;
  reference?: string;
  costCenterId?: string;
  costCenterName?: string;
  projectId?: string;
  projectName?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  type: JournalEntryType;
  status: JournalEntryStatus;
  source: JournalEntrySource;
  entryDate: Date;
  periodId?: string;
  periodName?: string;
  description: string;
  reference?: string;
  sourceDocumentId?: string;
  sourceDocumentType?: string;
  currency: string;
  totalDebit: number;
  totalCredit: number;
  lines: JournalLine[];
  reversalOf?: string;
  reversedBy?: string;
  reversalDate?: Date;
  isRecurring: boolean;
  recurringSchedule?: string;
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  postedAt?: Date;
  postedBy?: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntryFilters {
  type?: JournalEntryType;
  status?: JournalEntryStatus;
  source?: JournalEntrySource;
  accountId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateJournalEntryDto {
  type: JournalEntryType;
  source?: JournalEntrySource;
  entryDate: Date;
  description: string;
  reference?: string;
  currency?: string;
  lines: Omit<JournalLine, 'id' | 'accountCode' | 'accountName'>[];
  notes?: string;
  isRecurring?: boolean;
  recurringSchedule?: string;
}

export interface UpdateJournalEntryDto {
  entryDate?: Date;
  description?: string;
  reference?: string;
  lines?: Omit<JournalLine, 'id' | 'accountCode' | 'accountName'>[];
  notes?: string;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je-1',
    entryNumber: 'JE-2024-0001',
    type: JournalEntryType.STANDARD,
    status: JournalEntryStatus.POSTED,
    source: JournalEntrySource.INVOICE,
    entryDate: new Date('2024-01-05'),
    periodId: 'period-2024-01',
    periodName: 'January 2024',
    description: 'Record sales invoice INV-2024-0001',
    reference: 'INV-2024-0001',
    sourceDocumentId: 'inv-1',
    sourceDocumentType: 'SALES_INVOICE',
    currency: 'USD',
    totalDebit: 48825,
    totalCredit: 48825,
    lines: [
      {
        id: 'jl-1-1',
        accountId: 'acc-4',
        accountCode: '1300',
        accountName: 'Accounts Receivable',
        description: 'ABC Manufacturing Co. - Invoice',
        debit: 48825,
        credit: 0,
      },
      {
        id: 'jl-1-2',
        accountId: 'acc-13',
        accountCode: '4000',
        accountName: 'Sales Revenue',
        description: 'Product sales',
        debit: 0,
        credit: 45000,
      },
      {
        id: 'jl-1-3',
        accountId: 'acc-21',
        accountCode: '2400',
        accountName: 'Sales Tax Payable',
        description: 'Sales tax collected',
        debit: 0,
        credit: 3825,
      },
    ],
    isRecurring: false,
    submittedAt: new Date('2024-01-05'),
    submittedBy: 'accountant@company.com',
    approvedAt: new Date('2024-01-05'),
    approvedBy: 'controller@company.com',
    postedAt: new Date('2024-01-06'),
    postedBy: 'controller@company.com',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06'),
  },
  {
    id: 'je-2',
    entryNumber: 'JE-2024-0002',
    type: JournalEntryType.STANDARD,
    status: JournalEntryStatus.POSTED,
    source: JournalEntrySource.PAYMENT,
    entryDate: new Date('2024-02-02'),
    periodId: 'period-2024-02',
    periodName: 'February 2024',
    description: 'Record payment received PAY-2024-0001',
    reference: 'PAY-2024-0001',
    sourceDocumentId: 'pay-1',
    sourceDocumentType: 'PAYMENT_RECEIVED',
    currency: 'USD',
    totalDebit: 48825,
    totalCredit: 48825,
    lines: [
      {
        id: 'jl-2-1',
        accountId: 'acc-2',
        accountCode: '1100',
        accountName: 'Operating Bank Account',
        description: 'Payment from ABC Manufacturing',
        debit: 48825,
        credit: 0,
      },
      {
        id: 'jl-2-2',
        accountId: 'acc-4',
        accountCode: '1300',
        accountName: 'Accounts Receivable',
        description: 'Clear AR for INV-2024-0001',
        debit: 0,
        credit: 48825,
      },
    ],
    isRecurring: false,
    submittedAt: new Date('2024-02-02'),
    approvedAt: new Date('2024-02-02'),
    postedAt: new Date('2024-02-02'),
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-02'),
  },
  {
    id: 'je-3',
    entryNumber: 'JE-2024-0003',
    type: JournalEntryType.ADJUSTING,
    status: JournalEntryStatus.POSTED,
    source: JournalEntrySource.DEPRECIATION,
    entryDate: new Date('2024-01-31'),
    periodId: 'period-2024-01',
    periodName: 'January 2024',
    description: 'Monthly depreciation - January 2024',
    reference: 'DEP-2024-01',
    currency: 'USD',
    totalDebit: 29167,
    totalCredit: 29167,
    lines: [
      {
        id: 'jl-3-1',
        accountId: 'acc-20',
        accountCode: '5400',
        accountName: 'Depreciation',
        description: 'Monthly depreciation expense',
        debit: 29167,
        credit: 0,
      },
      {
        id: 'jl-3-2',
        accountId: 'acc-22',
        accountCode: '1550',
        accountName: 'Accumulated Depreciation',
        description: 'Accumulated depreciation on fixed assets',
        debit: 0,
        credit: 29167,
      },
    ],
    isRecurring: true,
    recurringSchedule: 'MONTHLY',
    submittedAt: new Date('2024-01-31'),
    approvedAt: new Date('2024-01-31'),
    postedAt: new Date('2024-02-01'),
    createdAt: new Date('2024-01-31'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'je-4',
    entryNumber: 'JE-2024-0004',
    type: JournalEntryType.STANDARD,
    status: JournalEntryStatus.POSTED,
    source: JournalEntrySource.PAYROLL,
    entryDate: new Date('2024-01-15'),
    periodId: 'period-2024-01',
    periodName: 'January 2024',
    description: 'Bi-weekly payroll - Period ending 01/15/2024',
    reference: 'PR-2024-01-15',
    currency: 'USD',
    totalDebit: 125000,
    totalCredit: 125000,
    lines: [
      {
        id: 'jl-4-1',
        accountId: 'acc-17',
        accountCode: '5100',
        accountName: 'Salaries and Wages',
        description: 'Gross payroll',
        debit: 125000,
        credit: 0,
        costCenterId: 'cc-operations',
        costCenterName: 'Operations',
      },
      {
        id: 'jl-4-2',
        accountId: 'acc-2',
        accountCode: '1100',
        accountName: 'Operating Bank Account',
        description: 'Net payroll disbursement',
        debit: 0,
        credit: 93750,
      },
      {
        id: 'jl-4-3',
        accountId: 'acc-23',
        accountCode: '2500',
        accountName: 'Payroll Tax Payable',
        description: 'Federal & state withholdings',
        debit: 0,
        credit: 31250,
      },
    ],
    isRecurring: true,
    recurringSchedule: 'BIWEEKLY',
    submittedAt: new Date('2024-01-15'),
    approvedAt: new Date('2024-01-15'),
    postedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'je-5',
    entryNumber: 'JE-2024-0005',
    type: JournalEntryType.STANDARD,
    status: JournalEntryStatus.DRAFT,
    source: JournalEntrySource.MANUAL,
    entryDate: new Date('2024-01-20'),
    periodId: 'period-2024-01',
    periodName: 'January 2024',
    description: 'Reclassification of prepaid expenses',
    reference: 'RECLASS-2024-001',
    currency: 'USD',
    totalDebit: 15000,
    totalCredit: 15000,
    lines: [
      {
        id: 'jl-5-1',
        accountId: 'acc-18',
        accountCode: '5200',
        accountName: 'Rent and Utilities',
        description: 'Rent expense - January portion',
        debit: 15000,
        credit: 0,
      },
      {
        id: 'jl-5-2',
        accountId: 'acc-24',
        accountCode: '1350',
        accountName: 'Prepaid Rent',
        description: 'Release prepaid rent',
        debit: 0,
        credit: 15000,
      },
    ],
    isRecurring: false,
    notes: 'Draft - pending review by controller',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'je-6',
    entryNumber: 'JE-2024-0006',
    type: JournalEntryType.STANDARD,
    status: JournalEntryStatus.PENDING_APPROVAL,
    source: JournalEntrySource.MANUAL,
    entryDate: new Date('2024-01-22'),
    periodId: 'period-2024-01',
    periodName: 'January 2024',
    description: 'Write-off of obsolete inventory',
    reference: 'INV-WO-2024-001',
    currency: 'USD',
    totalDebit: 8500,
    totalCredit: 8500,
    lines: [
      {
        id: 'jl-6-1',
        accountId: 'acc-25',
        accountCode: '5500',
        accountName: 'Inventory Write-off',
        description: 'Obsolete raw materials',
        debit: 8500,
        credit: 0,
      },
      {
        id: 'jl-6-2',
        accountId: 'acc-5',
        accountCode: '1400',
        accountName: 'Inventory',
        description: 'Remove obsolete inventory',
        debit: 0,
        credit: 8500,
      },
    ],
    isRecurring: false,
    submittedAt: new Date('2024-01-22'),
    submittedBy: 'warehouse@company.com',
    notes: 'Approved by warehouse manager. Awaiting finance approval.',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: 'je-7',
    entryNumber: 'JE-2024-0007',
    type: JournalEntryType.ADJUSTING,
    status: JournalEntryStatus.POSTED,
    source: JournalEntrySource.ACCRUAL,
    entryDate: new Date('2024-01-31'),
    periodId: 'period-2024-01',
    periodName: 'January 2024',
    description: 'Accrue interest on short-term loan',
    reference: 'ACC-INT-2024-01',
    currency: 'USD',
    totalDebit: 2083,
    totalCredit: 2083,
    lines: [
      {
        id: 'jl-7-1',
        accountId: 'acc-26',
        accountCode: '5600',
        accountName: 'Interest Expense',
        description: 'January interest on short-term loan',
        debit: 2083,
        credit: 0,
      },
      {
        id: 'jl-7-2',
        accountId: 'acc-9',
        accountCode: '2200',
        accountName: 'Accrued Expenses',
        description: 'Accrued interest payable',
        debit: 0,
        credit: 2083,
      },
    ],
    isRecurring: true,
    recurringSchedule: 'MONTHLY',
    submittedAt: new Date('2024-01-31'),
    approvedAt: new Date('2024-01-31'),
    postedAt: new Date('2024-02-01'),
    createdAt: new Date('2024-01-31'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'je-8',
    entryNumber: 'JE-2024-0008',
    type: JournalEntryType.REVERSING,
    status: JournalEntryStatus.POSTED,
    source: JournalEntrySource.SYSTEM,
    entryDate: new Date('2024-02-01'),
    periodId: 'period-2024-02',
    periodName: 'February 2024',
    description: 'Reverse accrued interest entry JE-2024-0007',
    reference: 'REV-JE-2024-0007',
    currency: 'USD',
    totalDebit: 2083,
    totalCredit: 2083,
    reversalOf: 'je-7',
    lines: [
      {
        id: 'jl-8-1',
        accountId: 'acc-9',
        accountCode: '2200',
        accountName: 'Accrued Expenses',
        description: 'Reverse accrued interest',
        debit: 2083,
        credit: 0,
      },
      {
        id: 'jl-8-2',
        accountId: 'acc-26',
        accountCode: '5600',
        accountName: 'Interest Expense',
        description: 'Reverse interest expense',
        debit: 0,
        credit: 2083,
      },
    ],
    isRecurring: false,
    postedAt: new Date('2024-02-01'),
    postedBy: 'system',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'je-9',
    entryNumber: 'JE-2024-0009',
    type: JournalEntryType.STANDARD,
    status: JournalEntryStatus.APPROVED,
    source: JournalEntrySource.INVOICE,
    entryDate: new Date('2024-01-12'),
    periodId: 'period-2024-01',
    periodName: 'January 2024',
    description: 'Record purchase invoice from Steel Supply Co.',
    reference: 'INV-2024-0007',
    sourceDocumentId: 'inv-7',
    sourceDocumentType: 'PURCHASE_INVOICE',
    currency: 'USD',
    totalDebit: 94395,
    totalCredit: 94395,
    lines: [
      {
        id: 'jl-9-1',
        accountId: 'acc-5',
        accountCode: '1400',
        accountName: 'Inventory',
        description: 'Raw materials purchase',
        debit: 87000,
        credit: 0,
      },
      {
        id: 'jl-9-2',
        accountId: 'acc-27',
        accountCode: '1450',
        accountName: 'Input Tax Receivable',
        description: 'Purchase tax credit',
        debit: 7395,
        credit: 0,
      },
      {
        id: 'jl-9-3',
        accountId: 'acc-7',
        accountCode: '2000',
        accountName: 'Accounts Payable',
        description: 'Steel Supply Co. - Invoice',
        debit: 0,
        credit: 94395,
      },
    ],
    isRecurring: false,
    submittedAt: new Date('2024-01-12'),
    approvedAt: new Date('2024-01-13'),
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: 'je-10',
    entryNumber: 'JE-2024-0010',
    type: JournalEntryType.STANDARD,
    status: JournalEntryStatus.POSTED,
    source: JournalEntrySource.MANUAL,
    entryDate: new Date('2024-01-25'),
    periodId: 'period-2024-01',
    periodName: 'January 2024',
    description: 'Record marketing campaign expenses',
    reference: 'MKT-2024-Q1-001',
    currency: 'USD',
    totalDebit: 25000,
    totalCredit: 25000,
    lines: [
      {
        id: 'jl-10-1',
        accountId: 'acc-19',
        accountCode: '5300',
        accountName: 'Marketing and Advertising',
        description: 'Q1 digital marketing campaign',
        debit: 15000,
        credit: 0,
        costCenterId: 'cc-marketing',
        costCenterName: 'Marketing',
        projectId: 'proj-q1-campaign',
        projectName: 'Q1 Growth Campaign',
      },
      {
        id: 'jl-10-2',
        accountId: 'acc-19',
        accountCode: '5300',
        accountName: 'Marketing and Advertising',
        description: 'Trade show participation',
        debit: 10000,
        credit: 0,
        costCenterId: 'cc-marketing',
        costCenterName: 'Marketing',
      },
      {
        id: 'jl-10-3',
        accountId: 'acc-7',
        accountCode: '2000',
        accountName: 'Accounts Payable',
        description: 'Marketing agency invoice',
        debit: 0,
        credit: 25000,
      },
    ],
    isRecurring: false,
    submittedAt: new Date('2024-01-25'),
    approvedAt: new Date('2024-01-25'),
    postedAt: new Date('2024-01-25'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

// ============================================================================
// Journal Service
// ============================================================================

export class JournalService {
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

  // Get All Journal Entries with Filters
  static async getAllJournalEntries(filters?: JournalEntryFilters): Promise<{
    data: JournalEntry[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredEntries = [...MOCK_JOURNAL_ENTRIES];

      if (filters?.type) {
        filteredEntries = filteredEntries.filter((je) => je.type === filters.type);
      }
      if (filters?.status) {
        filteredEntries = filteredEntries.filter((je) => je.status === filters.status);
      }
      if (filters?.source) {
        filteredEntries = filteredEntries.filter((je) => je.source === filters.source);
      }
      if (filters?.accountId) {
        filteredEntries = filteredEntries.filter((je) =>
          je.lines.some((line) => line.accountId === filters.accountId)
        );
      }
      if (filters?.fromDate) {
        filteredEntries = filteredEntries.filter(
          (je) => new Date(je.entryDate) >= new Date(filters.fromDate!)
        );
      }
      if (filters?.toDate) {
        filteredEntries = filteredEntries.filter(
          (je) => new Date(je.entryDate) <= new Date(filters.toDate!)
        );
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredEntries = filteredEntries.filter(
          (je) =>
            je.entryNumber.toLowerCase().includes(searchLower) ||
            je.description.toLowerCase().includes(searchLower) ||
            je.reference?.toLowerCase().includes(searchLower)
        );
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const start = (page - 1) * limit;
      const paginatedEntries = filteredEntries.slice(start, start + limit);

      return {
        data: paginatedEntries,
        total: filteredEntries.length,
        page,
        limit,
      };
    }

    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.set('type', filters.type);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.source) queryParams.set('source', filters.source);
    if (filters?.accountId) queryParams.set('accountId', filters.accountId);
    if (filters?.fromDate) queryParams.set('fromDate', filters.fromDate.toISOString());
    if (filters?.toDate) queryParams.set('toDate', filters.toDate.toISOString());
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request(`/finance/journal-entries?${queryParams.toString()}`);
  }

  // Get Journal Entry by ID
  static async getJournalEntryById(id: string): Promise<JournalEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const entry = MOCK_JOURNAL_ENTRIES.find((je) => je.id === id);
      if (!entry) throw new Error('Journal entry not found');
      return entry;
    }
    return this.request<JournalEntry>(`/finance/journal-entries/${id}`);
  }

  // Create Journal Entry
  static async createJournalEntry(data: CreateJournalEntryDto): Promise<JournalEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Validate debits equal credits
      const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

      if (totalDebit !== totalCredit) {
        throw new Error('Journal entry must balance: debits must equal credits');
      }

      // Build journal lines with account details
      const lines: JournalLine[] = data.lines.map((line, index) => ({
        id: `jl-${Date.now()}-${index}`,
        accountId: line.accountId,
        accountCode: `ACCT-${line.accountId}`, // In real implementation, would look up account
        accountName: `Account ${line.accountId}`,
        description: line.description,
        debit: line.debit || 0,
        credit: line.credit || 0,
        reference: line.reference,
        costCenterId: line.costCenterId,
        costCenterName: line.costCenterName,
        projectId: line.projectId,
        projectName: line.projectName,
      }));

      const newEntry: JournalEntry = {
        id: `je-${Date.now()}`,
        entryNumber: `JE-2024-${String(MOCK_JOURNAL_ENTRIES.length + 1).padStart(4, '0')}`,
        type: data.type,
        status: JournalEntryStatus.DRAFT,
        source: data.source || JournalEntrySource.MANUAL,
        entryDate: new Date(data.entryDate),
        description: data.description,
        reference: data.reference,
        currency: data.currency || 'USD',
        totalDebit,
        totalCredit,
        lines,
        isRecurring: data.isRecurring || false,
        recurringSchedule: data.recurringSchedule,
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MOCK_JOURNAL_ENTRIES.push(newEntry);
      return newEntry;
    }

    return this.request<JournalEntry>('/finance/journal-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update Journal Entry
  static async updateJournalEntry(id: string, data: UpdateJournalEntryDto): Promise<JournalEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_JOURNAL_ENTRIES.findIndex((je) => je.id === id);
      if (index === -1) throw new Error('Journal entry not found');

      const entry = MOCK_JOURNAL_ENTRIES[index];
      if (entry.status !== JournalEntryStatus.DRAFT) {
        throw new Error('Only draft journal entries can be updated');
      }

      // Recalculate if lines changed
      if (data.lines) {
        const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

        if (totalDebit !== totalCredit) {
          throw new Error('Journal entry must balance: debits must equal credits');
        }

        const lines: JournalLine[] = data.lines.map((line, idx) => ({
          id: `jl-${Date.now()}-${idx}`,
          accountId: line.accountId,
          accountCode: `ACCT-${line.accountId}`,
          accountName: `Account ${line.accountId}`,
          description: line.description,
          debit: line.debit || 0,
          credit: line.credit || 0,
          reference: line.reference,
          costCenterId: line.costCenterId,
          costCenterName: line.costCenterName,
          projectId: line.projectId,
          projectName: line.projectName,
        }));

        MOCK_JOURNAL_ENTRIES[index] = {
          ...entry,
          ...data,
          lines,
          totalDebit,
          totalCredit,
          updatedAt: new Date(),
        } as JournalEntry;
      } else {
        MOCK_JOURNAL_ENTRIES[index] = {
          ...entry,
          ...data,
          updatedAt: new Date(),
        } as JournalEntry;
      }

      return MOCK_JOURNAL_ENTRIES[index];
    }

    return this.request<JournalEntry>(`/finance/journal-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Submit Journal Entry for Approval
  static async submitJournalEntry(id: string): Promise<JournalEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_JOURNAL_ENTRIES.findIndex((je) => je.id === id);
      if (index === -1) throw new Error('Journal entry not found');

      if (MOCK_JOURNAL_ENTRIES[index].status !== JournalEntryStatus.DRAFT) {
        throw new Error('Only draft journal entries can be submitted');
      }

      MOCK_JOURNAL_ENTRIES[index] = {
        ...MOCK_JOURNAL_ENTRIES[index],
        status: JournalEntryStatus.PENDING_APPROVAL,
        submittedAt: new Date(),
        submittedBy: 'current-user',
        updatedAt: new Date(),
      };

      return MOCK_JOURNAL_ENTRIES[index];
    }

    return this.request<JournalEntry>(`/finance/journal-entries/${id}/submit`, {
      method: 'POST',
    });
  }

  // Approve Journal Entry
  static async approveJournalEntry(id: string): Promise<JournalEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_JOURNAL_ENTRIES.findIndex((je) => je.id === id);
      if (index === -1) throw new Error('Journal entry not found');

      if (MOCK_JOURNAL_ENTRIES[index].status !== JournalEntryStatus.PENDING_APPROVAL) {
        throw new Error('Only pending journal entries can be approved');
      }

      MOCK_JOURNAL_ENTRIES[index] = {
        ...MOCK_JOURNAL_ENTRIES[index],
        status: JournalEntryStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: 'approver-user',
        updatedAt: new Date(),
      };

      return MOCK_JOURNAL_ENTRIES[index];
    }

    return this.request<JournalEntry>(`/finance/journal-entries/${id}/approve`, {
      method: 'POST',
    });
  }

  // Post Journal Entry
  static async postJournalEntry(id: string): Promise<JournalEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_JOURNAL_ENTRIES.findIndex((je) => je.id === id);
      if (index === -1) throw new Error('Journal entry not found');

      if (MOCK_JOURNAL_ENTRIES[index].status !== JournalEntryStatus.APPROVED) {
        throw new Error('Only approved journal entries can be posted');
      }

      MOCK_JOURNAL_ENTRIES[index] = {
        ...MOCK_JOURNAL_ENTRIES[index],
        status: JournalEntryStatus.POSTED,
        postedAt: new Date(),
        postedBy: 'accountant-user',
        updatedAt: new Date(),
      };

      return MOCK_JOURNAL_ENTRIES[index];
    }

    return this.request<JournalEntry>(`/finance/journal-entries/${id}/post`, {
      method: 'POST',
    });
  }

  // Reverse Journal Entry
  static async reverseJournalEntry(id: string, reversalDate?: Date): Promise<JournalEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const originalEntry = MOCK_JOURNAL_ENTRIES.find((je) => je.id === id);
      if (!originalEntry) throw new Error('Journal entry not found');

      if (originalEntry.status !== JournalEntryStatus.POSTED) {
        throw new Error('Only posted journal entries can be reversed');
      }

      if (originalEntry.reversedBy) {
        throw new Error('Journal entry has already been reversed');
      }

      // Create reversal entry with swapped debits/credits
      const reversalLines: JournalLine[] = originalEntry.lines.map((line, index) => ({
        ...line,
        id: `jl-rev-${Date.now()}-${index}`,
        debit: line.credit,
        credit: line.debit,
        description: `Reversal: ${line.description}`,
      }));

      const reversalEntry: JournalEntry = {
        id: `je-${Date.now()}`,
        entryNumber: `JE-2024-${String(MOCK_JOURNAL_ENTRIES.length + 1).padStart(4, '0')}`,
        type: JournalEntryType.REVERSING,
        status: JournalEntryStatus.POSTED,
        source: JournalEntrySource.SYSTEM,
        entryDate: reversalDate || new Date(),
        periodId: originalEntry.periodId,
        periodName: originalEntry.periodName,
        description: `Reversal of ${originalEntry.entryNumber}: ${originalEntry.description}`,
        reference: `REV-${originalEntry.entryNumber}`,
        currency: originalEntry.currency,
        totalDebit: originalEntry.totalCredit,
        totalCredit: originalEntry.totalDebit,
        lines: reversalLines,
        reversalOf: id,
        isRecurring: false,
        postedAt: new Date(),
        postedBy: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update original entry
      const originalIndex = MOCK_JOURNAL_ENTRIES.findIndex((je) => je.id === id);
      MOCK_JOURNAL_ENTRIES[originalIndex] = {
        ...originalEntry,
        status: JournalEntryStatus.REVERSED,
        reversedBy: reversalEntry.id,
        reversalDate: reversalEntry.entryDate,
        updatedAt: new Date(),
      };

      MOCK_JOURNAL_ENTRIES.push(reversalEntry);
      return reversalEntry;
    }

    return this.request<JournalEntry>(`/finance/journal-entries/${id}/reverse`, {
      method: 'POST',
      body: JSON.stringify({ reversalDate }),
    });
  }

  // Cancel Journal Entry
  static async cancelJournalEntry(id: string, reason?: string): Promise<JournalEntry> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_JOURNAL_ENTRIES.findIndex((je) => je.id === id);
      if (index === -1) throw new Error('Journal entry not found');

      const allowedStatuses = [
        JournalEntryStatus.DRAFT,
        JournalEntryStatus.PENDING_APPROVAL,
        JournalEntryStatus.APPROVED,
      ];
      if (!allowedStatuses.includes(MOCK_JOURNAL_ENTRIES[index].status)) {
        throw new Error('Journal entry cannot be cancelled in current status');
      }

      MOCK_JOURNAL_ENTRIES[index] = {
        ...MOCK_JOURNAL_ENTRIES[index],
        status: JournalEntryStatus.CANCELLED,
        notes: reason
          ? `${MOCK_JOURNAL_ENTRIES[index].notes}\nCancellation reason: ${reason}`
          : MOCK_JOURNAL_ENTRIES[index].notes,
        updatedAt: new Date(),
      };

      return MOCK_JOURNAL_ENTRIES[index];
    }

    return this.request<JournalEntry>(`/finance/journal-entries/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Delete Journal Entry (only drafts)
  static async deleteJournalEntry(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_JOURNAL_ENTRIES.findIndex((je) => je.id === id);
      if (index === -1) throw new Error('Journal entry not found');

      if (MOCK_JOURNAL_ENTRIES[index].status !== JournalEntryStatus.DRAFT) {
        throw new Error('Only draft journal entries can be deleted');
      }

      MOCK_JOURNAL_ENTRIES.splice(index, 1);
      return;
    }

    await this.request<void>(`/finance/journal-entries/${id}`, {
      method: 'DELETE',
    });
  }

  // Get Account Transactions (General Ledger)
  static async getAccountTransactions(
    accountId: string,
    filters?: { fromDate?: Date; toDate?: Date }
  ): Promise<{
    accountId: string;
    accountCode: string;
    accountName: string;
    openingBalance: number;
    closingBalance: number;
    transactions: {
      date: Date;
      entryNumber: string;
      description: string;
      debit: number;
      credit: number;
      balance: number;
    }[];
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Find all lines for the account
      const accountLines: {
        date: Date;
        entryNumber: string;
        description: string;
        debit: number;
        credit: number;
      }[] = [];

      MOCK_JOURNAL_ENTRIES
        .filter((je) => je.status === JournalEntryStatus.POSTED)
        .forEach((entry) => {
          entry.lines
            .filter((line) => line.accountId === accountId)
            .forEach((line) => {
              if (!filters?.fromDate || new Date(entry.entryDate) >= filters.fromDate) {
                if (!filters?.toDate || new Date(entry.entryDate) <= filters.toDate) {
                  accountLines.push({
                    date: entry.entryDate,
                    entryNumber: entry.entryNumber,
                    description: line.description || entry.description,
                    debit: line.debit,
                    credit: line.credit,
                  });
                }
              }
            });
        });

      // Sort by date
      accountLines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate running balance
      let balance = 0;
      const transactions = accountLines.map((line) => {
        balance += line.debit - line.credit;
        return { ...line, balance };
      });

      return {
        accountId,
        accountCode: `ACCT-${accountId}`,
        accountName: `Account ${accountId}`,
        openingBalance: 0,
        closingBalance: balance,
        transactions,
      };
    }

    const queryParams = new URLSearchParams();
    if (filters?.fromDate) queryParams.set('fromDate', filters.fromDate.toISOString());
    if (filters?.toDate) queryParams.set('toDate', filters.toDate.toISOString());

    return this.request(`/finance/journal-entries/account/${accountId}?${queryParams.toString()}`);
  }

  // Get Journal Entry Statistics
  static async getJournalStatistics(): Promise<{
    totalEntries: number;
    postedEntries: number;
    draftEntries: number;
    pendingApproval: number;
    totalDebits: number;
    totalCredits: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const byType: Record<string, number> = {};
      const bySource: Record<string, number> = {};

      MOCK_JOURNAL_ENTRIES.forEach((entry) => {
        byType[entry.type] = (byType[entry.type] || 0) + 1;
        bySource[entry.source] = (bySource[entry.source] || 0) + 1;
      });

      const postedEntries = MOCK_JOURNAL_ENTRIES.filter(
        (je) => je.status === JournalEntryStatus.POSTED
      );

      return {
        totalEntries: MOCK_JOURNAL_ENTRIES.length,
        postedEntries: postedEntries.length,
        draftEntries: MOCK_JOURNAL_ENTRIES.filter(
          (je) => je.status === JournalEntryStatus.DRAFT
        ).length,
        pendingApproval: MOCK_JOURNAL_ENTRIES.filter(
          (je) => je.status === JournalEntryStatus.PENDING_APPROVAL
        ).length,
        totalDebits: postedEntries.reduce((sum, je) => sum + je.totalDebit, 0),
        totalCredits: postedEntries.reduce((sum, je) => sum + je.totalCredit, 0),
        byType,
        bySource,
      };
    }

    return this.request('/finance/journal-entries/statistics');
  }
}

// Export singleton instance
export const journalService = JournalService;
