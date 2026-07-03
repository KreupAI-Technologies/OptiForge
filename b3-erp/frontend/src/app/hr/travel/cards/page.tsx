'use client';

import { useState, useMemo, useEffect } from 'react';
import { CreditCard, User, DollarSign, Calendar, AlertCircle, Lock, Unlock, Plus, Eye, Download } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { toast } from '@/hooks/use-toast';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface CorporateCard {
  id: string;
  cardNumber: string;
  cardholderName: string;
  employeeCode: string;
  department: string;
  designation: string;
  cardType: 'visa' | 'mastercard' | 'amex';
  cardLevel: 'silver' | 'gold' | 'platinum';
  creditLimit: number;
  availableLimit: number;
  currentBalance: number;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'blocked' | 'expired' | 'pending_activation';
  lastTransactionDate?: string;
  monthlySpend: number;
  billingCycle: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCardType, setSelectedCardType] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CorporateCard | null>(null);
  const [rows, setRows] = useState<CorporateCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getCorporateCards();
        const mapped: CorporateCard[] = raw.map((r) => ({
          id: r.id,
          cardNumber: r.cardNumber ?? '',
          cardholderName: r.cardholderName ?? '',
          employeeCode: r.employeeCode ?? '',
          department: r.department ?? '',
          designation: r.designation ?? '',
          cardType: (r.cardType as CorporateCard['cardType']) ?? 'visa',
          cardLevel: 'silver',
          creditLimit: Number(r.creditLimit ?? 0),
          availableLimit: Number(r.availableLimit ?? 0),
          currentBalance: Number(r.currentBalance ?? 0),
          issueDate: r.issueDate ?? '',
          expiryDate: r.expiryDate ?? '',
          status: (r.status as CorporateCard['status']) ?? 'active',
          lastTransactionDate: r.lastTransactionDate ?? undefined,
          monthlySpend: Number(r.monthlySpend ?? 0),
          billingCycle: r.billingCycle ?? '',
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load corporate cards');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mockCards: CorporateCard[] = rows.length ? rows : [
    {
      id: '1',
      cardNumber: '****4523',
      cardholderName: 'Rajesh Kumar',
      employeeCode: 'EMP456',
      department: 'Sales',
      designation: 'Sales Manager',
      cardType: 'visa',
      cardLevel: 'gold',
      creditLimit: 200000,
      availableLimit: 165000,
      currentBalance: 35000,
      issueDate: '2024-01-15',
      expiryDate: '2027-01-31',
      status: 'active',
      lastTransactionDate: '2025-11-05',
      monthlySpend: 45000,
      billingCycle: '1st to Last day of month'
    },
    {
      id: '2',
      cardNumber: '****6789',
      cardholderName: 'Priya Sharma',
      employeeCode: 'EMP789',
      department: 'Engineering',
      designation: 'Engineering Head',
      cardType: 'mastercard',
      cardLevel: 'platinum',
      creditLimit: 300000,
      availableLimit: 280000,
      currentBalance: 20000,
      issueDate: '2023-06-20',
      expiryDate: '2026-06-30',
      status: 'active',
      lastTransactionDate: '2025-11-04',
      monthlySpend: 52000,
      billingCycle: '1st to Last day of month'
    },
    {
      id: '3',
      cardNumber: '****3421',
      cardholderName: 'Amit Singh',
      employeeCode: 'EMP234',
      department: 'Operations',
      designation: 'Operations Manager',
      cardType: 'visa',
      cardLevel: 'silver',
      creditLimit: 150000,
      availableLimit: 142000,
      currentBalance: 8000,
      issueDate: '2024-03-10',
      expiryDate: '2027-03-31',
      status: 'active',
      lastTransactionDate: '2025-11-03',
      monthlySpend: 28000,
      billingCycle: '1st to Last day of month'
    },
    {
      id: '4',
      cardNumber: '****9087',
      cardholderName: 'Meena Rao',
      employeeCode: 'EMP567',
      department: 'Quality',
      designation: 'QA Manager',
      cardType: 'amex',
      cardLevel: 'gold',
      creditLimit: 250000,
      availableLimit: 250000,
      currentBalance: 0,
      issueDate: '2024-08-01',
      expiryDate: '2027-08-31',
      status: 'blocked',
      lastTransactionDate: '2025-10-15',
      monthlySpend: 0,
      billingCycle: '1st to Last day of month'
    },
    {
      id: '5',
      cardNumber: '****5432',
      cardholderName: 'Suresh Patel',
      employeeCode: 'EMP890',
      department: 'Maintenance',
      designation: 'Maintenance Head',
      cardType: 'visa',
      cardLevel: 'silver',
      creditLimit: 150000,
      availableLimit: 138000,
      currentBalance: 12000,
      issueDate: '2024-02-20',
      expiryDate: '2027-02-28',
      status: 'active',
      lastTransactionDate: '2025-11-06',
      monthlySpend: 35000,
      billingCycle: '1st to Last day of month'
    },
    {
      id: '6',
      cardNumber: '****7654',
      cardholderName: 'Kavita Nair',
      employeeCode: 'EMP345',
      department: 'Marketing',
      designation: 'Marketing Manager',
      cardType: 'mastercard',
      cardLevel: 'gold',
      creditLimit: 200000,
      availableLimit: 200000,
      currentBalance: 0,
      issueDate: '2025-10-01',
      expiryDate: '2028-10-31',
      status: 'pending_activation',
      monthlySpend: 0,
      billingCycle: '1st to Last day of month'
    }
  ];

  const filteredCards = useMemo(() => {
    return mockCards.filter(card => {
      const matchesStatus = selectedStatus === 'all' || card.status === selectedStatus;
      const matchesType = selectedCardType === 'all' || card.cardType === selectedCardType;
      return matchesStatus && matchesType;
    });
  }, [selectedStatus, selectedCardType]);

  const stats = {
    totalCards: mockCards.length,
    activeCards: mockCards.filter(c => c.status === 'active').length,
    blockedCards: mockCards.filter(c => c.status === 'blocked').length,
    totalLimit: mockCards.reduce((sum, c) => sum + c.creditLimit, 0),
    totalOutstanding: mockCards.reduce((sum, c) => sum + c.currentBalance, 0),
    availableLimit: mockCards.reduce((sum, c) => sum + c.availableLimit, 0),
    monthlySpend: mockCards.reduce((sum, c) => sum + c.monthlySpend, 0)
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      pending_activation: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getCardTypeIcon = (type: string) => {
    // Return appropriate styling based on card type
    const styles = {
      visa: 'text-blue-600',
      mastercard: 'text-orange-600',
      amex: 'text-green-600'
    };
    return styles[type as keyof typeof styles];
  };

  const getLevelColor = (level: string) => {
    const colors = {
      silver: 'bg-gray-200 text-gray-800',
      gold: 'bg-yellow-200 text-yellow-900',
      platinum: 'bg-purple-200 text-purple-900'
    };
    return colors[level as keyof typeof colors];
  };

  const handleViewDetails = (card: CorporateCard) => {
    setSelectedCard(card);
    setShowDetailsModal(true);
  };

  const handleBlockCard = (card: CorporateCard) => {
    toast({
      title: "Card Blocked",
      description: `Card ${card.cardNumber} has been blocked successfully`
    });
  };

  const handleUnblockCard = (card: CorporateCard) => {
    toast({
      title: "Card Unblocked",
      description: `Card ${card.cardNumber} has been activated successfully`
    });
  };

  const handleDownloadStatement = (card: CorporateCard) => {
    toast({
      title: "Downloading Statement",
      description: `Downloading statement for card ${card.cardNumber}`
    });
  };

  const handleRequestNewCard = () => {
    setShowRequestModal(true);
  };

  const columns = [
    { key: 'cardNumber', label: 'Card', sortable: true,
      render: (v: string, row: CorporateCard) => (
        <div className="flex items-center gap-2">
          <CreditCard className={`h-5 w-5 ${getCardTypeIcon(row.cardType)}`} />
          <div>
            <div className="font-mono font-semibold text-gray-900">{v}</div>
            <div className="text-xs text-gray-500">{row.cardType.toUpperCase()}</div>
          </div>
        </div>
      )
    },
    { key: 'cardholderName', label: 'Cardholder', sortable: true,
      render: (v: string, row: CorporateCard) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.employeeCode} - {row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'cardLevel', label: 'Level', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelColor(v)}`}>
          {v.toUpperCase()}
        </span>
      )
    },
    { key: 'creditLimit', label: 'Credit Limit', sortable: true,
      render: (v: number) => <div className="text-sm font-semibold text-gray-900">₹{(v / 1000).toFixed(0)}k</div>
    },
    { key: 'currentBalance', label: 'Outstanding', sortable: true,
      render: (v: number, row: CorporateCard) => (
        <div>
          <div className="text-sm font-bold text-red-600">₹{v.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500">
            Available: ₹{(row.availableLimit / 1000).toFixed(0)}k
          </div>
        </div>
      )
    },
    { key: 'expiryDate', label: 'Expiry', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v === 'pending_activation' ? 'Pending' : v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      )
    },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: CorporateCard) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          {row.status === 'active' && (
            <button
              onClick={() => handleBlockCard(row)}
              className="p-1 hover:bg-red-100 rounded"
              title="Block card"
            >
              <Lock className="h-4 w-4 text-red-600" />
            </button>
          )}
          {row.status === 'blocked' && (
            <button
              onClick={() => handleUnblockCard(row)}
              className="p-1 hover:bg-green-100 rounded"
              title="Unblock card"
            >
              <Unlock className="h-4 w-4 text-green-600" />
            </button>
          )}
          <button
            onClick={() => handleDownloadStatement(row)}
            className="p-1 hover:bg-blue-100 rounded"
            title="Download statement"
          >
            <Download className="h-4 w-4 text-blue-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-blue-600" />
          Corporate Credit Cards
        </h1>
        <p className="text-gray-600 mt-2">Manage company-issued credit cards for employees</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading corporate cards…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cards</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalCards}</p>
            </div>
            <CreditCard className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeCards}</p>
            </div>
            <User className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{stats.blockedCards}</p>
            </div>
            <Lock className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Limit</p>
              <p className="text-xl font-bold text-indigo-600">₹{(stats.totalLimit / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-xl font-bold text-orange-600">₹{(stats.totalOutstanding / 1000).toFixed(0)}k</p>
            </div>
            <AlertCircle className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-xl font-bold text-purple-600">₹{(stats.availableLimit / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Spend</p>
              <p className="text-xl font-bold text-teal-600">₹{(stats.monthlySpend / 1000).toFixed(0)}k</p>
            </div>
            <Calendar className="h-10 w-10 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="expired">Expired</option>
              <option value="pending_activation">Pending Activation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Card Type:</label>
            <select
              value={selectedCardType}
              onChange={(e) => setSelectedCardType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRequestNewCard}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Request New Card
            </button>
          </div>
        </div>
      </div>

      {/* Cards Table */}
      <DataTable data={filteredCards} columns={columns} />

      {/* Card Levels Info */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Card Levels & Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="p-4 bg-gray-50 border-l-4 border-gray-600 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Silver Card</h4>
            <p className="text-sm text-gray-700">Credit Limit: ₹1,00,000 - ₹1,50,000</p>
            <p className="text-xs text-gray-600 mt-2">For Managers and Senior Staff</p>
            <p className="text-xs text-gray-600">Eligible: Employees with 2+ years tenure</p>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Gold Card</h4>
            <p className="text-sm text-gray-700">Credit Limit: ₹2,00,000 - ₹2,50,000</p>
            <p className="text-xs text-gray-600 mt-2">For Department Heads</p>
            <p className="text-xs text-gray-600">Eligible: Senior managers with frequent travel</p>
          </div>
          <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Platinum Card</h4>
            <p className="text-sm text-gray-700">Credit Limit: ₹3,00,000 - ₹5,00,000</p>
            <p className="text-xs text-gray-600 mt-2">For Directors and C-Level Executives</p>
            <p className="text-xs text-gray-600">Eligible: Top management with international travel</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Corporate Card Management</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All transactions are automatically captured and synced with expense system</li>
          <li>• Monthly statements are generated on 1st of every month</li>
          <li>• Payment due date is 15th of every month</li>
          <li>• Cards can be temporarily blocked in case of loss or suspected fraud</li>
          <li>• Credit limit utilization above 80% triggers automatic alerts</li>
          <li>• Card renewal process starts 60 days before expiry</li>
          <li>• Personal expenses on corporate cards must be reimbursed within 7 days</li>
        </ul>
      </div>

      {/* Card Details Modal */}
      {showDetailsModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className={`h-6 w-6 ${getCardTypeIcon(selectedCard.cardType)}`} />
                Card Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Card Visual */}
              <div className={`relative p-3 rounded-xl text-white h-48 ${
                selectedCard.cardType === 'visa' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                selectedCard.cardType === 'mastercard' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                'bg-gradient-to-br from-green-500 to-green-700'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs opacity-80">Company Name</p>
                    <p className="font-semibold">Manufacturing Corp</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getLevelColor(selectedCard.cardLevel)}`}>
                    {selectedCard.cardLevel.toUpperCase()}
                  </span>
                </div>
                <div className="mt-8">
                  <p className="text-xs opacity-80 mb-1">Card Number</p>
                  <p className="text-xl font-mono tracking-wider">{selectedCard.cardNumber}</p>
                </div>
                <div className="flex justify-between items-end mt-6">
                  <div>
                    <p className="text-xs opacity-80">Cardholder</p>
                    <p className="font-semibold">{selectedCard.cardholderName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-80">Expires</p>
                    <p className="font-semibold">{new Date(selectedCard.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              {/* Cardholder Information */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Cardholder Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Employee Code</p>
                    <p className="font-semibold text-gray-900">{selectedCard.employeeCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Department</p>
                    <p className="font-semibold text-gray-900">{selectedCard.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Designation</p>
                    <p className="font-semibold text-gray-900">{selectedCard.designation}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedCard.status)}`}>
                      {selectedCard.status === 'pending_activation' ? 'Pending' : selectedCard.status.charAt(0).toUpperCase() + selectedCard.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Credit Information */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Credit Information</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Credit Limit</p>
                    <p className="text-xl font-bold text-blue-600">₹{selectedCard.creditLimit.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Available Limit</p>
                    <p className="text-xl font-bold text-green-600">₹{selectedCard.availableLimit.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Current Balance</p>
                    <p className="text-xl font-bold text-red-600">₹{selectedCard.currentBalance.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Credit Utilization</span>
                    <span>{((selectedCard.currentBalance / selectedCard.creditLimit) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (selectedCard.currentBalance / selectedCard.creditLimit) * 100 > 80 ? 'bg-red-600' :
                        (selectedCard.currentBalance / selectedCard.creditLimit) * 100 > 50 ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${(selectedCard.currentBalance / selectedCard.creditLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Transaction Information */}
              <div className="bg-purple-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Transaction Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Monthly Spend</p>
                    <p className="text-lg font-bold text-purple-600">₹{selectedCard.monthlySpend.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Transaction</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCard.lastTransactionDate ? new Date(selectedCard.lastTransactionDate).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Billing Cycle</p>
                    <p className="font-semibold text-gray-900">{selectedCard.billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Card Type</p>
                    <p className="font-semibold text-gray-900">{selectedCard.cardType.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Card Dates */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Important Dates</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Issue Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedCard.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expiry Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedCard.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadStatement(selectedCard)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Download className="h-4 w-4" />
                  Download Statement
                </button>
                {selectedCard.status === 'active' && (
                  <button
                    onClick={() => {
                      handleBlockCard(selectedCard);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    <Lock className="h-4 w-4" />
                    Block Card
                  </button>
                )}
                {selectedCard.status === 'blocked' && (
                  <button
                    onClick={() => {
                      handleUnblockCard(selectedCard);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    <Unlock className="h-4 w-4" />
                    Unblock Card
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request New Card Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-6 w-6 text-blue-600" />
                Request New Corporate Card
              </h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                toast({
                  title: "Card Request Submitted",
                  description: "Your corporate card request has been submitted for approval"
                });
                setShowRequestModal(false);
              }}>
                <div className="space-y-3">
                  {/* Employee Information */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Employee Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., EMP123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select department</option>
                          <option value="sales">Sales</option>
                          <option value="engineering">Engineering</option>
                          <option value="operations">Operations</option>
                          <option value="quality">Quality</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="marketing">Marketing</option>
                          <option value="finance">Finance</option>
                          <option value="hr">Human Resources</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Manager"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Card Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Type *</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select card type</option>
                          <option value="visa">Visa</option>
                          <option value="mastercard">Mastercard</option>
                          <option value="amex">American Express</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requested Card Level *</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select level</option>
                          <option value="silver">Silver (₹1L - ₹1.5L)</option>
                          <option value="gold">Gold (₹2L - ₹2.5L)</option>
                          <option value="platinum">Platinum (₹3L - ₹5L)</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requested Credit Limit *</label>
                        <input
                          type="number"
                          required
                          min="100000"
                          max="500000"
                          step="10000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 150000"
                        />
                        <p className="text-xs text-gray-500 mt-1">Amount should be between ₹1,00,000 and ₹5,00,000</p>
                      </div>
                    </div>
                  </div>

                  {/* Justification */}
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Request Justification</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select purpose</option>
                          <option value="frequent_travel">Frequent Business Travel</option>
                          <option value="client_meetings">Client Meetings & Entertainment</option>
                          <option value="field_operations">Field Operations</option>
                          <option value="vendor_visits">Vendor Visits</option>
                          <option value="international_travel">International Travel</option>
                          <option value="emergency_expenses">Emergency Business Expenses</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Expected Usage *</label>
                        <input
                          type="number"
                          required
                          min="5000"
                          step="1000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 50000"
                        />
                        <p className="text-xs text-gray-500 mt-1">Estimated monthly spend on the card</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Justification Details *</label>
                        <textarea
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Please provide detailed justification for the card request, including frequency of travel, typical expenses, and business need..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manager Approval (Name & Email) *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Manager name and email"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-red-900 mb-2">Terms & Conditions</h3>
                    <div className="space-y-2 text-xs text-red-800">
                      <label className="flex items-start gap-2">
                        <input type="checkbox" required className="mt-0.5" />
                        <span>I understand that this card is for business expenses only and personal use is strictly prohibited</span>
                      </label>
                      <label className="flex items-start gap-2">
                        <input type="checkbox" required className="mt-0.5" />
                        <span>I will submit expense reports within 7 days of each transaction</span>
                      </label>
                      <label className="flex items-start gap-2">
                        <input type="checkbox" required className="mt-0.5" />
                        <span>I will maintain all receipts and supporting documents for all transactions</span>
                      </label>
                      <label className="flex items-start gap-2">
                        <input type="checkbox" required className="mt-0.5" />
                        <span>I understand that any personal expenses must be reimbursed within 7 days</span>
                      </label>
                      <label className="flex items-start gap-2">
                        <input type="checkbox" required className="mt-0.5" />
                        <span>I will report the card immediately if lost or stolen</span>
                      </label>
                      <label className="flex items-start gap-2">
                        <input type="checkbox" required className="mt-0.5" />
                        <span>I agree to return the card upon termination of employment or change in role</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
