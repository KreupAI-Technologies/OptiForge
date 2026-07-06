/**
 * Payment Service
 * Handles payment management and allocation
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Type Definitions
// ============================================================================

export enum PaymentType {
  RECEIVED = 'RECEIVED',
  MADE = 'MADE',
  REFUND = 'REFUND',
  TRANSFER = 'TRANSFER',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
  WIRE_TRANSFER = 'WIRE_TRANSFER',
  ACH = 'ACH',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  allocatedAmount: number;
  allocatedAt: Date;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  customerId?: string;
  customerName?: string;
  vendorId?: string;
  vendorName?: string;
  amount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  currency: string;
  paymentDate: Date;
  reference?: string;
  bankAccountId?: string;
  bankAccountName?: string;
  checkNumber?: string;
  transactionId?: string;
  notes?: string;
  allocations: PaymentAllocation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentFilters {
  type?: PaymentType;
  status?: PaymentStatus;
  method?: PaymentMethod;
  customerId?: string;
  vendorId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreatePaymentDto {
  type: PaymentType;
  method: PaymentMethod;
  customerId?: string;
  customerName?: string;
  vendorId?: string;
  vendorName?: string;
  amount: number;
  currency?: string;
  paymentDate: Date;
  reference?: string;
  bankAccountId?: string;
  checkNumber?: string;
  transactionId?: string;
  notes?: string;
}

export interface AllocatePaymentDto {
  allocations: {
    invoiceId: string;
    amount: number;
  }[];
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    paymentNumber: 'PAY-2024-0001',
    type: PaymentType.RECEIVED,
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.COMPLETED,
    customerId: 'cust-1',
    customerName: 'ABC Manufacturing Co.',
    amount: 48825,
    allocatedAmount: 48825,
    unallocatedAmount: 0,
    currency: 'USD',
    paymentDate: new Date('2024-02-02'),
    reference: 'Payment for INV-2024-0001',
    bankAccountId: 'acc-2',
    bankAccountName: 'Operating Bank Account',
    transactionId: 'TXN-ABC-20240202-001',
    notes: 'Full payment received',
    allocations: [
      {
        id: 'alloc-1',
        paymentId: 'pay-1',
        invoiceId: 'inv-1',
        invoiceNumber: 'INV-2024-0001',
        allocatedAmount: 48825,
        allocatedAt: new Date('2024-02-02'),
      },
    ],
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-02'),
  },
  {
    id: 'pay-2',
    paymentNumber: 'PAY-2024-0002',
    type: PaymentType.RECEIVED,
    method: PaymentMethod.CHECK,
    status: PaymentStatus.COMPLETED,
    customerId: 'cust-2',
    customerName: 'XYZ Industries Ltd.',
    amount: 25000,
    allocatedAmount: 25000,
    unallocatedAmount: 0,
    currency: 'USD',
    paymentDate: new Date('2024-01-10'),
    reference: 'Partial payment for INV-2024-0002',
    bankAccountId: 'acc-2',
    bankAccountName: 'Operating Bank Account',
    checkNumber: 'CHK-45678',
    notes: 'Partial payment - customer requested installment plan',
    allocations: [
      {
        id: 'alloc-2',
        paymentId: 'pay-2',
        invoiceId: 'inv-2',
        invoiceNumber: 'INV-2024-0002',
        allocatedAmount: 25000,
        allocatedAt: new Date('2024-01-10'),
      },
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'pay-3',
    paymentNumber: 'PAY-2024-0003',
    type: PaymentType.RECEIVED,
    method: PaymentMethod.WIRE_TRANSFER,
    status: PaymentStatus.COMPLETED,
    customerId: 'cust-6',
    customerName: 'Midwest Components Corp.',
    amount: 35000,
    allocatedAmount: 35000,
    unallocatedAmount: 0,
    currency: 'USD',
    paymentDate: new Date('2024-01-20'),
    reference: 'First installment for INV-2024-0006',
    bankAccountId: 'acc-2',
    bankAccountName: 'Operating Bank Account',
    transactionId: 'WIRE-MWC-20240120',
    notes: 'Installment 1 of 2',
    allocations: [
      {
        id: 'alloc-3',
        paymentId: 'pay-3',
        invoiceId: 'inv-6',
        invoiceNumber: 'INV-2024-0006',
        allocatedAmount: 35000,
        allocatedAt: new Date('2024-01-20'),
      },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'pay-4',
    paymentNumber: 'PAY-2024-0004',
    type: PaymentType.MADE,
    method: PaymentMethod.ACH,
    status: PaymentStatus.COMPLETED,
    vendorId: 'vend-1',
    vendorName: 'Steel Supply Co.',
    amount: 45000,
    allocatedAmount: 45000,
    unallocatedAmount: 0,
    currency: 'USD',
    paymentDate: new Date('2024-01-15'),
    reference: 'Partial payment for raw materials',
    bankAccountId: 'acc-2',
    bankAccountName: 'Operating Bank Account',
    transactionId: 'ACH-OUT-20240115-001',
    notes: 'Supplier payment batch #2024-01',
    allocations: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'pay-5',
    paymentNumber: 'PAY-2024-0005',
    type: PaymentType.RECEIVED,
    method: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.PENDING,
    customerId: 'cust-9',
    customerName: 'Quick Parts LLC',
    amount: 12500,
    allocatedAmount: 0,
    unallocatedAmount: 12500,
    currency: 'USD',
    paymentDate: new Date('2024-01-22'),
    reference: 'CC Payment pending settlement',
    transactionId: 'CC-TXN-20240122-9876',
    notes: 'Credit card payment awaiting settlement',
    allocations: [],
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: 'pay-6',
    paymentNumber: 'PAY-2024-0006',
    type: PaymentType.MADE,
    method: PaymentMethod.CHECK,
    status: PaymentStatus.COMPLETED,
    vendorId: 'vend-2',
    vendorName: 'Industrial Supplies Inc.',
    amount: 28500,
    allocatedAmount: 28500,
    unallocatedAmount: 0,
    currency: 'USD',
    paymentDate: new Date('2024-01-14'),
    reference: 'Monthly supplies payment',
    bankAccountId: 'acc-2',
    bankAccountName: 'Operating Bank Account',
    checkNumber: 'CHK-2024-0089',
    notes: 'Vendor payment for January supplies',
    allocations: [],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: 'pay-7',
    paymentNumber: 'PAY-2024-0007',
    type: PaymentType.RECEIVED,
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.PROCESSING,
    customerId: 'cust-10',
    customerName: 'Northern Manufacturing',
    amount: 67500,
    allocatedAmount: 0,
    unallocatedAmount: 67500,
    currency: 'USD',
    paymentDate: new Date('2024-01-23'),
    reference: 'Bank transfer in progress',
    bankAccountId: 'acc-2',
    bankAccountName: 'Operating Bank Account',
    transactionId: 'PENDING-NM-20240123',
    notes: 'Transfer initiated, awaiting clearance',
    allocations: [],
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23'),
  },
  {
    id: 'pay-8',
    paymentNumber: 'PAY-2024-0008',
    type: PaymentType.REFUND,
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.COMPLETED,
    customerId: 'cust-1',
    customerName: 'ABC Manufacturing Co.',
    amount: 5425,
    allocatedAmount: 5425,
    unallocatedAmount: 0,
    currency: 'USD',
    paymentDate: new Date('2024-01-18'),
    reference: 'Refund for returned items (Credit Note INV-2024-0009)',
    bankAccountId: 'acc-2',
    bankAccountName: 'Operating Bank Account',
    transactionId: 'REF-ABC-20240118',
    notes: 'Refund processed for defective parts return',
    allocations: [
      {
        id: 'alloc-8',
        paymentId: 'pay-8',
        invoiceId: 'inv-9',
        invoiceNumber: 'INV-2024-0009',
        allocatedAmount: 5425,
        allocatedAt: new Date('2024-01-18'),
      },
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 'pay-9',
    paymentNumber: 'PAY-2024-0009',
    type: PaymentType.MADE,
    method: PaymentMethod.WIRE_TRANSFER,
    status: PaymentStatus.FAILED,
    vendorId: 'vend-3',
    vendorName: 'Global Components Ltd.',
    amount: 125000,
    allocatedAmount: 0,
    unallocatedAmount: 125000,
    currency: 'USD',
    paymentDate: new Date('2024-01-21'),
    reference: 'International wire transfer',
    bankAccountId: 'acc-2',
    bankAccountName: 'Operating Bank Account',
    transactionId: 'WIRE-FAIL-20240121',
    notes: 'Wire transfer failed - incorrect beneficiary details. Needs to be resubmitted.',
    allocations: [],
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: 'pay-10',
    paymentNumber: 'PAY-2024-0010',
    type: PaymentType.RECEIVED,
    method: PaymentMethod.CASH,
    status: PaymentStatus.COMPLETED,
    customerId: 'cust-11',
    customerName: 'Local Machine Shop',
    amount: 3500,
    allocatedAmount: 0,
    unallocatedAmount: 3500,
    currency: 'USD',
    paymentDate: new Date('2024-01-24'),
    reference: 'Walk-in cash payment',
    notes: 'Cash payment for small parts order - to be allocated',
    allocations: [],
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24'),
  },
];

// ============================================================================
// Payment Service
// ============================================================================

export class PaymentService {
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

  // Get All Payments with Filters
  static async getAllPayments(filters?: PaymentFilters): Promise<{
    data: Payment[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredPayments = [...MOCK_PAYMENTS];

      if (filters?.type) {
        filteredPayments = filteredPayments.filter((p) => p.type === filters.type);
      }
      if (filters?.status) {
        filteredPayments = filteredPayments.filter((p) => p.status === filters.status);
      }
      if (filters?.method) {
        filteredPayments = filteredPayments.filter((p) => p.method === filters.method);
      }
      if (filters?.customerId) {
        filteredPayments = filteredPayments.filter((p) => p.customerId === filters.customerId);
      }
      if (filters?.vendorId) {
        filteredPayments = filteredPayments.filter((p) => p.vendorId === filters.vendorId);
      }
      if (filters?.fromDate) {
        filteredPayments = filteredPayments.filter(
          (p) => new Date(p.paymentDate) >= new Date(filters.fromDate!)
        );
      }
      if (filters?.toDate) {
        filteredPayments = filteredPayments.filter(
          (p) => new Date(p.paymentDate) <= new Date(filters.toDate!)
        );
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPayments = filteredPayments.filter(
          (p) =>
            p.paymentNumber.toLowerCase().includes(searchLower) ||
            p.customerName?.toLowerCase().includes(searchLower) ||
            p.vendorName?.toLowerCase().includes(searchLower) ||
            p.reference?.toLowerCase().includes(searchLower)
        );
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const start = (page - 1) * limit;
      const paginatedPayments = filteredPayments.slice(start, start + limit);

      return {
        data: paginatedPayments,
        total: filteredPayments.length,
        page,
        limit,
      };
    }

    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.set('type', filters.type);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.method) queryParams.set('method', filters.method);
    if (filters?.customerId) queryParams.set('customerId', filters.customerId);
    if (filters?.vendorId) queryParams.set('vendorId', filters.vendorId);
    if (filters?.fromDate) queryParams.set('fromDate', filters.fromDate.toISOString());
    if (filters?.toDate) queryParams.set('toDate', filters.toDate.toISOString());
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request(`/finance/payments?${queryParams.toString()}`);
  }

  // Get Payment by ID
  static async getPaymentById(id: string): Promise<Payment> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const payment = MOCK_PAYMENTS.find((p) => p.id === id);
      if (!payment) throw new Error('Payment not found');
      return payment;
    }
    return this.request<Payment>(`/finance/payments/${id}`);
  }

  // Get payment verification queue (aggregated verification records)
  static async getVerificationQueue(): Promise<Array<{
    id: string;
    woNumber: string;
    customerName: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
    paymentMethod?: string;
    receiptNumber?: string;
    status: string;
    verifiedBy?: string;
    verificationDate?: string;
    notes?: string;
  }>> {
    return this.request(`/finance/payments/verification-queue`);
  }

  // Create Payment
  static async createPayment(data: CreatePaymentDto): Promise<Payment> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        paymentNumber: `PAY-2024-${String(MOCK_PAYMENTS.length + 1).padStart(4, '0')}`,
        type: data.type,
        method: data.method,
        status: PaymentStatus.PENDING,
        customerId: data.customerId,
        customerName: data.customerName,
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        amount: data.amount,
        allocatedAmount: 0,
        unallocatedAmount: data.amount,
        currency: data.currency || 'USD',
        paymentDate: new Date(data.paymentDate),
        reference: data.reference,
        bankAccountId: data.bankAccountId,
        checkNumber: data.checkNumber,
        transactionId: data.transactionId,
        notes: data.notes,
        allocations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MOCK_PAYMENTS.push(newPayment);
      return newPayment;
    }

    return this.request<Payment>('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Allocate Payment to Invoices
  static async allocatePayment(id: string, data: AllocatePaymentDto): Promise<Payment> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_PAYMENTS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Payment not found');

      const payment = MOCK_PAYMENTS[index];
      const totalAllocation = data.allocations.reduce((sum, a) => sum + a.amount, 0);

      if (totalAllocation > payment.unallocatedAmount) {
        throw new Error('Allocation amount exceeds unallocated balance');
      }

      const newAllocations: PaymentAllocation[] = data.allocations.map((alloc, idx) => ({
        id: `alloc-${Date.now()}-${idx}`,
        paymentId: id,
        invoiceId: alloc.invoiceId,
        invoiceNumber: `INV-ALLOC-${idx}`, // In real implementation, would look up invoice
        allocatedAmount: alloc.amount,
        allocatedAt: new Date(),
      }));

      MOCK_PAYMENTS[index] = {
        ...payment,
        allocatedAmount: payment.allocatedAmount + totalAllocation,
        unallocatedAmount: payment.unallocatedAmount - totalAllocation,
        allocations: [...payment.allocations, ...newAllocations],
        updatedAt: new Date(),
      };

      return MOCK_PAYMENTS[index];
    }

    return this.request<Payment>(`/finance/payments/${id}/allocate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Remove Payment Allocation
  static async removeAllocation(paymentId: string, allocationId: string): Promise<Payment> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_PAYMENTS.findIndex((p) => p.id === paymentId);
      if (index === -1) throw new Error('Payment not found');

      const payment = MOCK_PAYMENTS[index];
      const allocation = payment.allocations.find((a) => a.id === allocationId);
      if (!allocation) throw new Error('Allocation not found');

      MOCK_PAYMENTS[index] = {
        ...payment,
        allocatedAmount: payment.allocatedAmount - allocation.allocatedAmount,
        unallocatedAmount: payment.unallocatedAmount + allocation.allocatedAmount,
        allocations: payment.allocations.filter((a) => a.id !== allocationId),
        updatedAt: new Date(),
      };

      return MOCK_PAYMENTS[index];
    }

    return this.request<Payment>(`/finance/payments/${paymentId}/allocations/${allocationId}`, {
      method: 'DELETE',
    });
  }

  // Complete Payment (mark as completed)
  static async completePayment(id: string): Promise<Payment> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_PAYMENTS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Payment not found');

      if (MOCK_PAYMENTS[index].status !== PaymentStatus.PENDING &&
          MOCK_PAYMENTS[index].status !== PaymentStatus.PROCESSING) {
        throw new Error('Payment cannot be completed in current status');
      }

      MOCK_PAYMENTS[index] = {
        ...MOCK_PAYMENTS[index],
        status: PaymentStatus.COMPLETED,
        updatedAt: new Date(),
      };

      return MOCK_PAYMENTS[index];
    }

    return this.request<Payment>(`/finance/payments/${id}/complete`, {
      method: 'POST',
    });
  }

  // Cancel Payment
  static async cancelPayment(id: string, reason?: string): Promise<Payment> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_PAYMENTS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Payment not found');

      if (MOCK_PAYMENTS[index].status === PaymentStatus.COMPLETED) {
        throw new Error('Completed payments cannot be cancelled');
      }

      MOCK_PAYMENTS[index] = {
        ...MOCK_PAYMENTS[index],
        status: PaymentStatus.CANCELLED,
        notes: reason
          ? `${MOCK_PAYMENTS[index].notes}\nCancellation reason: ${reason}`
          : MOCK_PAYMENTS[index].notes,
        updatedAt: new Date(),
      };

      return MOCK_PAYMENTS[index];
    }

    return this.request<Payment>(`/finance/payments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Refund Payment
  static async refundPayment(id: string, amount?: number, reason?: string): Promise<Payment> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const originalPayment = MOCK_PAYMENTS.find((p) => p.id === id);
      if (!originalPayment) throw new Error('Payment not found');

      if (originalPayment.status !== PaymentStatus.COMPLETED) {
        throw new Error('Only completed payments can be refunded');
      }

      const refundAmount = amount || originalPayment.amount;
      if (refundAmount > originalPayment.amount) {
        throw new Error('Refund amount cannot exceed original payment');
      }

      // Create refund payment
      const refundPayment: Payment = {
        id: `pay-${Date.now()}`,
        paymentNumber: `PAY-2024-${String(MOCK_PAYMENTS.length + 1).padStart(4, '0')}`,
        type: PaymentType.REFUND,
        method: originalPayment.method,
        status: PaymentStatus.COMPLETED,
        customerId: originalPayment.customerId,
        customerName: originalPayment.customerName,
        vendorId: originalPayment.vendorId,
        vendorName: originalPayment.vendorName,
        amount: refundAmount,
        allocatedAmount: 0,
        unallocatedAmount: refundAmount,
        currency: originalPayment.currency,
        paymentDate: new Date(),
        reference: `Refund for ${originalPayment.paymentNumber}`,
        bankAccountId: originalPayment.bankAccountId,
        bankAccountName: originalPayment.bankAccountName,
        notes: reason || `Refund for payment ${originalPayment.paymentNumber}`,
        allocations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update original payment status
      const index = MOCK_PAYMENTS.findIndex((p) => p.id === id);
      if (refundAmount === originalPayment.amount) {
        MOCK_PAYMENTS[index] = {
          ...MOCK_PAYMENTS[index],
          status: PaymentStatus.REFUNDED,
          updatedAt: new Date(),
        };
      }

      MOCK_PAYMENTS.push(refundPayment);
      return refundPayment;
    }

    return this.request<Payment>(`/finance/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  // Get Payment Statistics
  static async getPaymentStatistics(): Promise<{
    totalReceived: number;
    totalPaid: number;
    pendingReceipts: number;
    pendingPayments: number;
    unallocatedAmount: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const byMethod: Record<string, number> = {};
      const byStatus: Record<string, number> = {};

      MOCK_PAYMENTS.forEach((payment) => {
        byMethod[payment.method] = (byMethod[payment.method] || 0) + payment.amount;
        byStatus[payment.status] = (byStatus[payment.status] || 0) + 1;
      });

      const completedReceived = MOCK_PAYMENTS
        .filter((p) => p.type === PaymentType.RECEIVED && p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.amount, 0);

      const completedPaid = MOCK_PAYMENTS
        .filter((p) => p.type === PaymentType.MADE && p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingReceived = MOCK_PAYMENTS
        .filter((p) => p.type === PaymentType.RECEIVED &&
                      [PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(p.status))
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingPaid = MOCK_PAYMENTS
        .filter((p) => p.type === PaymentType.MADE &&
                      [PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(p.status))
        .reduce((sum, p) => sum + p.amount, 0);

      const unallocated = MOCK_PAYMENTS
        .filter((p) => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.unallocatedAmount, 0);

      return {
        totalReceived: completedReceived,
        totalPaid: completedPaid,
        pendingReceipts: pendingReceived,
        pendingPayments: pendingPaid,
        unallocatedAmount: unallocated,
        byMethod,
        byStatus,
      };
    }

    return this.request('/finance/payments/statistics');
  }

  // Get Unallocated Payments
  static async getUnallocatedPayments(): Promise<Payment[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_PAYMENTS.filter(
        (p) => p.status === PaymentStatus.COMPLETED && p.unallocatedAmount > 0
      );
    }
    return this.request<Payment[]>('/finance/payments/unallocated');
  }

  // Get Payments for Customer
  static async getCustomerPayments(customerId: string): Promise<Payment[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_PAYMENTS.filter((p) => p.customerId === customerId);
    }
    return this.request<Payment[]>(`/finance/payments/customer/${customerId}`);
  }

  // Get Payments for Vendor
  static async getVendorPayments(vendorId: string): Promise<Payment[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_PAYMENTS.filter((p) => p.vendorId === vendorId);
    }
    return this.request<Payment[]>(`/finance/payments/vendor/${vendorId}`);
  }
}

// Export singleton instance
export const paymentService = PaymentService;
