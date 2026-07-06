// HR Self-Service Service
// Wraps the NestJS domain backend endpoints for travel, expenses,
// reimbursement, corporate cards, alumni, overtime, safety incidents and the
// training catalogue. These are the orphan-endpoint builds under /hr/*.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-company-id': 'test' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-company-id': 'test' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

function qs(params: Record<string, string | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

export interface TravelRequest {
  id: string;
  companyId: string;
  requestNumber?: string;
  employeeCode?: string;
  employeeName?: string;
  department?: string;
  designation?: string;
  travelType?: string;
  purpose?: string;
  fromLocation?: string;
  toLocation?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  estimatedCost?: number;
  totalCost?: number;
  advanceAmount?: number;
  expensesClaimed?: number;
  status?: string;
  submittedDate?: string;
  approver?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TravelAdvance {
  id: string;
  companyId: string;
  advanceNumber?: string;
  employeeName?: string;
  department?: string;
  tripNumber?: string;
  destination?: string;
  travelDates?: string;
  advanceAmount?: number;
  requestedDate?: string;
  purpose?: string;
  status?: string;
  approver?: string;
  approvedDate?: string;
  disbursedDate?: string;
  settledDate?: string;
  expensesSubmitted?: number;
  balanceAmount?: number;
}

export interface CorporateCard {
  id: string;
  companyId: string;
  cardNumber?: string;
  cardType?: string;
  cardholderName?: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  cardProvider?: string;
  creditLimit?: number;
  availableLimit?: number;
  currentBalance?: number;
  monthlySpend?: number;
  issueDate?: string;
  expiryDate?: string;
  lastTransactionDate?: string;
  billingCycle?: string;
  status?: string;
}

export interface CardTransaction {
  id: string;
  companyId: string;
  transactionId?: string;
  cardNumber?: string;
  cardType?: string;
  cardHolder?: string;
  employeeCode?: string;
  department?: string;
  merchantName?: string;
  category?: string;
  amount?: number;
  currency?: string;
  transactionDate?: string;
  transactionTime?: string;
  location?: string;
  status?: string;
  receiptUploaded?: boolean;
  notes?: string;
}

export interface ExpenseClaim {
  id: string;
  companyId: string;
  kind?: string;
  claimNumber?: string;
  employeeCode?: string;
  employeeName?: string;
  department?: string;
  designation?: string;
  category?: string;
  claimType?: string;
  description?: string;
  amount?: number;
  advanceAmount?: number;
  cardExpenses?: number;
  netPayable?: number;
  destination?: string;
  travelRequestId?: string;
  travelDates?: string;
  billDate?: string;
  submissionDate?: string;
  submittedDate?: string;
  itemsCount?: number;
  documentsCount?: number;
  receiptAttached?: boolean;
  priority?: string;
  pendingDays?: number;
  status?: string;
  approver?: string;
  approvedDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  rejectionReason?: string;
  items?: Record<string, unknown>[];
}

export interface Alumni {
  id: string;
  companyId: string;
  kind?: string;
  employeeCode?: string;
  name?: string;
  designation?: string;
  department?: string;
  joinDate?: string;
  exitDate?: string;
  tenure?: string;
  currentCompany?: string;
  currentDesignation?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  achievements?: string[];
  industryExpertise?: string[];
  willingToMentor?: boolean;
  availableForRehire?: boolean;
  reasonForLeaving?: string;
  lastContactDate?: string;
  previousDesignation?: string;
  proposedDesignation?: string;
  proposedDepartment?: string;
  proposedCTC?: number;
  requestedBy?: string;
  requestDate?: string;
  eligibilityScore?: number;
  performanceRating?: string;
  backgroundCheckStatus?: string;
  comments?: string;
  details?: Record<string, unknown>;
  status?: string;
}

export interface OvertimeRequest {
  id: string;
  companyId: string;
  requestId?: string;
  employeeCode?: string;
  employeeName?: string;
  department?: string;
  designation?: string;
  date?: string;
  shiftType?: string;
  regularHours?: number;
  overtimeHours?: number;
  reason?: string;
  requestDate?: string;
  status?: string;
  approvedBy?: string;
  approvedDate?: string;
  calculatedAmount?: number;
}

export interface SafetyIncident {
  id: string;
  companyId: string;
  incidentNumber?: string;
  reportedDate?: string;
  incidentDate?: string;
  incidentTime?: string;
  location?: string;
  department?: string;
  severity?: string;
  type?: string;
  description?: string;
  reportedBy?: string;
  employeeInvolved?: string;
  witnessCount?: number;
  status?: string;
  investigator?: string;
  rootCause?: string;
  daysLost?: number;
  medicalAttention?: boolean;
}

export interface TrainingProgram {
  id: string;
  companyId: string;
  code?: string;
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: number;
  mode?: string;
  instructor?: string;
  department?: string;
  capacity?: number;
  enrolled?: number;
  cost?: number;
  nextBatch?: string;
  location?: string;
  certification?: boolean;
  status?: string;
}

async function list<T>(path: string): Promise<T[]> {
  const data = await getJson<T[]>(path);
  return Array.isArray(data) ? data : [];
}

export class HrSelfServiceService {
  static getTravelRequests(status?: string) {
    return list<TravelRequest>(`/hr/travel-requests${qs({ status })}`);
  }
  static getTravelAdvances(status?: string) {
    return list<TravelAdvance>(`/hr/travel-advances${qs({ status })}`);
  }
  static getCorporateCards(status?: string) {
    return list<CorporateCard>(`/hr/corporate-cards${qs({ status })}`);
  }
  static getCardTransactions(status?: string) {
    return list<CardTransaction>(`/hr/card-transactions${qs({ status })}`);
  }
  static getExpenseClaims(filters?: { kind?: string; status?: string }) {
    return list<ExpenseClaim>(`/hr/expense-claims${qs({ ...filters })}`);
  }
  static getAlumni(filters?: { kind?: string; status?: string }) {
    return list<Alumni>(`/hr/alumni${qs({ ...filters })}`);
  }
  static getOvertimeRequests(status?: string) {
    return list<OvertimeRequest>(`/hr/overtime-requests${qs({ status })}`);
  }
  static createOvertimeRequest(payload: Partial<OvertimeRequest>) {
    return postJson<OvertimeRequest>('/hr/overtime-requests', {
      companyId: 'default-company-id',
      ...payload,
    });
  }
  static getSafetyIncidents(status?: string) {
    return list<SafetyIncident>(`/hr/safety-incidents${qs({ status })}`);
  }
  static getTrainingPrograms(filters?: { category?: string; status?: string }) {
    return list<TrainingProgram>(`/hr/training-programs${qs({ ...filters })}`);
  }
}
