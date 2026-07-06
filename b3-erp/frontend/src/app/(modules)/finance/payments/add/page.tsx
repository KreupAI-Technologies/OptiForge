'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FinanceService } from '@/services/finance.service';
import {
  ArrowLeft,
  Save,
  X,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Building,
  User,
  Hash,
  AlertCircle,
  Info,
  Upload,
  Trash2,
  CheckCircle,
  Smartphone,
  Banknote,
  Landmark,
  Receipt,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
} from 'lucide-react';

interface PaymentFormData {
  paymentType: 'received' | 'made';
  partyType: 'customer' | 'vendor';
  partyId: string;
  partyName: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentDate: string;
  transactionDate: string;
  paymentAmount: number;
  transactionFee: number;
  paymentMethod: 'bank_transfer' | 'upi' | 'credit_card' | 'debit_card' | 'check' | 'cash' | 'neft' | 'rtgs' | 'imps';
  referenceNumber: string;
  transactionId: string;
  bankAccountId: string;
  bankName: string;
  bankAccountNumber: string;
  bankIFSC: string;
  bankBranch: string;
  upiId?: string;
  cardLastFourDigits?: string;
  cardType?: string;
  checkNumber?: string;
  checkDate?: string;
  notes: string;
  internalNotes: string;
}

interface Party {
  id: string;
  name: string;
  type: 'customer' | 'vendor';
  email: string;
  phone: string;
  outstandingAmount: number;
}

interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  selected: boolean;
  allocatedAmount: number;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  balance: number;
}

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'neft', label: 'NEFT', icon: Landmark },
  { value: 'rtgs', label: 'RTGS', icon: Landmark },
  { value: 'imps', label: 'IMPS', icon: Smartphone },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { value: 'debit_card', label: 'Debit Card', icon: CreditCard },
  { value: 'check', label: 'Check', icon: Receipt },
  { value: 'cash', label: 'Cash', icon: Banknote },
];

export default function PaymentAddPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [outstandingInvoices, setOutstandingInvoices] = useState<OutstandingInvoice[]>([]);
  const [bankAccountsList, setBankAccountsList] = useState<BankAccount[]>([]);
  const [customers, setCustomers] = useState<Party[]>([]);
  const [vendors, setVendors] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [coa, receivables, payables] = await Promise.all([
          FinanceService.getChartOfAccounts().catch(() => []),
          FinanceService.getReceivables().catch(() => []),
          FinanceService.getPayables().catch(() => []),
        ]);
        if (cancelled) return;
        const banks = Array.isArray(coa)
          ? coa
              .filter((a: any) => a.isBankAccount)
              .map((a: any, i: number) => ({
                id: String(a.id ?? i + 1),
                bankName: String(a.name ?? ''),
                accountNumber: String(a.code ?? ''),
                ifscCode: '',
                branch: '',
                balance: Number(a.balance ?? 0),
              }))
          : [];
        setBankAccountsList(banks);
        setCustomers(
          (Array.isArray(receivables) ? receivables : []).map((r: any, i: number) => ({
            id: String(r.id ?? r.customerId ?? i + 1),
            name: String(r.customer ?? r.customerName ?? r.name ?? ''),
            type: 'customer' as const,
            email: String(r.email ?? ''),
            phone: String(r.phone ?? ''),
            outstandingAmount: Number(r.outstandingAmount ?? r.balanceDue ?? r.balance ?? 0),
          }))
        );
        setVendors(
          (Array.isArray(payables) ? payables : []).map((p: any, i: number) => ({
            id: String(p.id ?? p.vendorId ?? i + 1),
            name: String(p.vendor ?? p.vendorName ?? p.name ?? ''),
            type: 'vendor' as const,
            email: String(p.email ?? ''),
            phone: String(p.phone ?? ''),
            outstandingAmount: Number(p.outstandingAmount ?? p.balanceDue ?? p.balance ?? 0),
          }))
        );
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load payment reference data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [formData, setFormData] = useState<PaymentFormData>({
    paymentType: 'received',
    partyType: 'customer',
    partyId: '',
    partyName: '',
    invoiceId: '',
    invoiceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionDate: new Date().toISOString().split('T')[0],
    paymentAmount: 0,
    transactionFee: 0,
    paymentMethod: 'neft',
    referenceNumber: '',
    transactionId: '',
    bankAccountId: '',
    bankName: '',
    bankAccountNumber: '',
    bankIFSC: '',
    bankBranch: '',
    notes: '',
    internalNotes: '',
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const parties = formData.paymentType === 'received' ? customers : vendors;
  const filteredParties = parties.filter((party) =>
    party.name.toLowerCase().includes(partySearchQuery.toLowerCase())
  );

  const handleInputChange = (field: keyof PaymentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePaymentTypeChange = (type: 'received' | 'made') => {
    setFormData({
      ...formData,
      paymentType: type,
      partyType: type === 'received' ? 'customer' : 'vendor',
      partyId: '',
      partyName: '',
      invoiceId: '',
      invoiceNumber: '',
    });
    setOutstandingInvoices([]);
  };

  const handlePartySelect = async (party: Party) => {
    setFormData({
      ...formData,
      partyId: party.id,
      partyName: party.name,
      partyType: party.type,
    });
    setShowPartyDropdown(false);
    setPartySearchQuery('');

    // Load outstanding invoices for the selected party
    try {
      const invoiceType = party.type === 'customer' ? 'receivable' : 'payable';
      const raw = await FinanceService.getInvoices({ partyId: party.id, invoiceType });
      const mapped: OutstandingInvoice[] = (Array.isArray(raw) ? raw : []).map((inv: any, i: number) => ({
        id: String(inv.id ?? i + 1),
        invoiceNumber: String(inv.invoiceNumber ?? ''),
        invoiceDate: String(inv.invoiceDate ?? ''),
        dueDate: String(inv.dueDate ?? ''),
        totalAmount: Number(inv.total ?? inv.totalAmount ?? 0),
        paidAmount: Number(inv.paidAmount ?? 0),
        balanceAmount: Number(inv.balanceDue ?? inv.balanceAmount ?? 0),
        selected: false,
        allocatedAmount: 0,
      }));
      setOutstandingInvoices(mapped);
    } catch {
      setOutstandingInvoices([]);
    }
  };

  const handleInvoiceSelection = (invoiceId: string) => {
    setOutstandingInvoices((prevInvoices) =>
      prevInvoices.map((inv) => {
        if (inv.id === invoiceId) {
          const isSelected = !inv.selected;
          return {
            ...inv,
            selected: isSelected,
            allocatedAmount: isSelected ? inv.balanceAmount : 0,
          };
        }
        return inv;
      })
    );
  };

  const handleAllocationChange = (invoiceId: string, amount: number) => {
    setOutstandingInvoices((prevInvoices) =>
      prevInvoices.map((inv) => {
        if (inv.id === invoiceId) {
          const allocatedAmount = Math.min(amount, inv.balanceAmount);
          return { ...inv, allocatedAmount };
        }
        return inv;
      })
    );
  };

  const handleBankAccountSelect = (accountId: string) => {
    const account = bankAccountsList.find((acc) => acc.id === accountId);
    if (account) {
      setFormData((prev) => ({
        ...prev,
        bankAccountId: accountId,
        bankName: account.bankName,
        bankAccountNumber: account.accountNumber,
        bankIFSC: account.ifscCode,
        bankBranch: account.branch,
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const totalAllocated = outstandingInvoices.reduce((sum, inv) => sum + inv.allocatedAmount, 0);
  const selectedInvoicesCount = outstandingInvoices.filter((inv) => inv.selected).length;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.partyId) {
      newErrors.partyId = 'Please select a customer or vendor';
    }

    if (selectedInvoicesCount === 0) {
      newErrors.invoices = 'Please select at least one invoice to pay';
    }

    if (totalAllocated <= 0) {
      newErrors.paymentAmount = 'Payment amount must be greater than 0';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required';
    }

    if (!formData.referenceNumber.trim()) {
      newErrors.referenceNumber = 'Reference number is required';
    }

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    }

    if (
      (formData.paymentMethod === 'bank_transfer' ||
        formData.paymentMethod === 'neft' ||
        formData.paymentMethod === 'rtgs' ||
        formData.paymentMethod === 'imps') &&
      !formData.bankAccountId
    ) {
      newErrors.bankDetails = 'Please select a bank account';
    }

    if (formData.paymentMethod === 'upi' && !formData.upiId) {
      newErrors.upiId = 'UPI ID is required for UPI payments';
    }

    if (
      (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') &&
      !formData.cardLastFourDigits
    ) {
      newErrors.cardLastFourDigits = 'Card details are required';
    }

    if (formData.paymentMethod === 'check' && (!formData.checkNumber || !formData.checkDate)) {
      newErrors.checkDetails = 'Check number and date are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        ...formData,
        paymentAmount: totalAllocated,
        invoices: outstandingInvoices.filter((inv) => inv.selected),
        companyId: 'default-company-id',
      };

      await FinanceService.createPayment(paymentData);

      router.push('/finance/payments');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/finance/payments');
  };

  const netAmount = totalAllocated - formData.transactionFee;
  const selectedMethod = paymentMethods.find((m) => m.value === formData.paymentMethod);
  const MethodIcon = selectedMethod?.icon || CreditCard;

  const requiresBankDetails =
    formData.paymentMethod === 'bank_transfer' ||
    formData.paymentMethod === 'neft' ||
    formData.paymentMethod === 'rtgs' ||
    formData.paymentMethod === 'imps';

  const requiresUPI = formData.paymentMethod === 'upi';
  const requiresCardDetails =
    formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card';
  const requiresCheckDetails = formData.paymentMethod === 'check';

  const selectedParty = parties.find((p) => p.id === formData.partyId);
  const selectedBankAccount = bankAccountsList.find((acc) => acc.id === formData.bankAccountId);

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="mb-3">
        <button onClick={handleCancel} className="flex items-center text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payments
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Record New Payment</h1>
              <p className="text-gray-600 mt-1">Create a new payment record for customer or vendor</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          {/* Payment Type Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Type</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePaymentTypeChange('received')}
                className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all ${
                  formData.paymentType === 'received'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="h-10 w-10 mb-3 text-green-600" />
                <span className="text-lg font-semibold">Payment Received</span>
                <span className="text-sm text-gray-500 mt-1">From Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentTypeChange('made')}
                className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all ${
                  formData.paymentType === 'made'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="h-10 w-10 mb-3 text-blue-600" />
                <span className="text-lg font-semibold">Payment Made</span>
                <span className="text-sm text-gray-500 mt-1">To Vendor</span>
              </button>
            </div>
          </div>

          {/* Party Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Select {formData.paymentType === 'received' ? 'Customer' : 'Vendor'}
              <span className="text-red-500 ml-1">*</span>
            </h3>

            <div className="relative">
              <div
                onClick={() => setShowPartyDropdown(!showPartyDropdown)}
                className={`w-full px-4 py-3 border ${
                  errors.partyId ? 'border-red-300' : 'border-gray-300'
                } rounded-lg cursor-pointer flex items-center justify-between hover:border-gray-400`}
              >
                <div className="flex items-center">
                  {formData.partyId ? (
                    <>
                      <User className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">{formData.partyName}</p>
                        <p className="text-sm text-gray-500">{formData.partyId}</p>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">
                      Select {formData.paymentType === 'received' ? 'customer' : 'vendor'}
                    </span>
                  )}
                </div>
                {showPartyDropdown ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {showPartyDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={partySearchQuery}
                        onChange={(e) => setPartySearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search..."
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredParties.map((party) => (
                      <div
                        key={party.id}
                        onClick={() => handlePartySelect(party)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{party.name}</p>
                            <p className="text-sm text-gray-500">{party.id}</p>
                            <p className="text-xs text-gray-400">{party.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Outstanding</p>
                            <p className="font-bold text-orange-700">INR {party.outstandingAmount.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.partyId && <p className="text-red-500 text-sm mt-2">{errors.partyId}</p>}

            {selectedParty && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-blue-700">Email</p>
                    <p className="font-medium text-blue-900">{selectedParty.email}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Phone</p>
                    <p className="font-medium text-blue-900">{selectedParty.phone}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Outstanding Amount</p>
                    <p className="font-bold text-orange-700">
                      INR {selectedParty.outstandingAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Outstanding Invoices */}
          {formData.partyId && outstandingInvoices.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Outstanding {formData.paymentType === 'received' ? 'Invoices' : 'Bills'}
                <span className="text-red-500 ml-1">*</span>
              </h3>

              <div className="space-y-3">
                {outstandingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      invoice.selected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <button
                        type="button"
                        onClick={() => handleInvoiceSelection(invoice.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
                          invoice.selected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}
                      >
                        {invoice.selected && <Check className="h-4 w-4 text-white" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500">
                              Issued: {invoice.invoiceDate} | Due: {invoice.dueDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Balance</p>
                            <p className="font-bold text-orange-700">
                              INR {invoice.balanceAmount.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {invoice.selected && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Allocate Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center space-x-3">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  INR
                                </span>
                                <input
                                  type="number"
                                  value={invoice.allocatedAmount}
                                  onChange={(e) => handleAllocationChange(invoice.id, parseFloat(e.target.value) || 0)}
                                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0.00"
                                  step="0.01"
                                  max={invoice.balanceAmount}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAllocationChange(invoice.id, invoice.balanceAmount)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                              >
                                Full Amount
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.invoices && <p className="text-red-500 text-sm mt-2">{errors.invoices}</p>}

              <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Total Payment Amount</p>
                    <p className="text-xs text-green-600 mt-1">{selectedInvoicesCount} invoice(s) selected</p>
                  </div>
                  <p className="text-3xl font-bold text-green-700">INR {totalAllocated.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {formData.partyId && (
            <>
              {/* Payment Method */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <MethodIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Payment Method <span className="text-red-500 ml-1">*</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => handleInputChange('paymentMethod', method.value)}
                        className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all ${
                          formData.paymentMethod === method.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium text-center">{method.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Bank Details */}
                {requiresBankDetails && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Bank Account <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.bankAccountId}
                        onChange={(e) => handleBankAccountSelect(e.target.value)}
                        className={`w-full px-4 py-2 border ${
                          errors.bankDetails ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select a bank account</option>
                        {bankAccountsList.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.bankName} - {account.accountNumber} (Balance: INR{' '}
                            {account.balance.toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                      {errors.bankDetails && <p className="text-red-500 text-xs mt-1">{errors.bankDetails}</p>}
                    </div>

                    {selectedBankAccount && (
                      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-indigo-700">Bank Name</p>
                            <p className="font-semibold text-indigo-900">{selectedBankAccount.bankName}</p>
                          </div>
                          <div>
                            <p className="text-indigo-700">Account Number</p>
                            <p className="font-mono text-indigo-900">{selectedBankAccount.accountNumber}</p>
                          </div>
                          <div>
                            <p className="text-indigo-700">IFSC Code</p>
                            <p className="font-mono text-indigo-900">{selectedBankAccount.ifscCode}</p>
                          </div>
                          <div>
                            <p className="text-indigo-700">Branch</p>
                            <p className="font-medium text-indigo-900">{selectedBankAccount.branch}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* UPI Details */}
                {requiresUPI && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.upiId || ''}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      className={`w-full px-4 py-2 border ${
                        errors.upiId ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="user@upi"
                    />
                    {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
                  </div>
                )}

                {/* Card Details */}
                {requiresCardDetails && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.cardType || ''}
                          onChange={(e) => handleInputChange('cardType', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select card type</option>
                          <option value="Visa">Visa</option>
                          <option value="Mastercard">Mastercard</option>
                          <option value="RuPay">RuPay</option>
                          <option value="American Express">American Express</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last 4 Digits <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.cardLastFourDigits || ''}
                          onChange={(e) => handleInputChange('cardLastFourDigits', e.target.value)}
                          className={`w-full px-4 py-2 border ${
                            errors.cardLastFourDigits ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="1234"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    {errors.cardLastFourDigits && <p className="text-red-500 text-sm">{errors.cardLastFourDigits}</p>}
                  </div>
                )}

                {/* Check Details */}
                {requiresCheckDetails && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.checkNumber || ''}
                          onChange={(e) => handleInputChange('checkNumber', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter check number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.checkDate || ''}
                          onChange={(e) => handleInputChange('checkDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    {errors.checkDetails && <p className="text-red-500 text-sm">{errors.checkDetails}</p>}
                  </div>
                )}
              </div>

              {/* Transaction Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <Hash className="h-5 w-5 mr-2 text-blue-600" />
                  Transaction Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border ${
                          errors.paymentDate ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.transactionDate}
                        onChange={(e) => handleInputChange('transactionDate', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border ${
                          errors.transactionDate ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    {errors.transactionDate && <p className="text-red-500 text-xs mt-1">{errors.transactionDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                      className={`w-full px-4 py-2 border ${
                        errors.referenceNumber ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter reference number"
                    />
                    {errors.referenceNumber && <p className="text-red-500 text-xs mt-1">{errors.referenceNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.transactionId}
                      onChange={(e) => handleInputChange('transactionId', e.target.value)}
                      className={`w-full px-4 py-2 border ${
                        errors.transactionId ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter transaction ID"
                    />
                    {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Fee</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">INR</span>
                      <input
                        type="number"
                        value={formData.transactionFee}
                        onChange={(e) => handleInputChange('transactionFee', parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">Net Amount</p>
                      <p className="text-xl font-bold text-green-900">INR {netAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter payment notes (visible to customer/vendor)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                    <textarea
                      value={formData.internalNotes}
                      onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter internal notes (not visible to customer/vendor)"
                    />
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Attach Receipt</h3>
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">Upload files</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.jpg,.png"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG up to 10MB</p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-gray-900">{file.name}</span>
                            <span className="text-sm text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">Please fix the following errors:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading || !formData.partyId}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Record Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
