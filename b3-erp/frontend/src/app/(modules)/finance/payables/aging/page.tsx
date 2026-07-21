'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Building,
  DollarSign,
  AlertCircle,
  Clock,
  TrendingUp,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface VendorAging {
  vendorId: string;
  vendorName: string;
  totalOutstanding: number;
  current: number;          // 0-30 days
  days31to60: number;       // 31-60 days
  days61to90: number;       // 61-90 days
  over90days: number;       // 90+ days
  creditLimit: number;
  paymentTerms: string;
  lastPayment: string;
  lastPaymentAmount: number;
  contactPerson: string;
  riskRating: 'low' | 'medium' | 'high';
  currency: string;
}

interface AgingSummary {
  totalOutstanding: number;
  current: number;
  days31to60: number;
  days61to90: number;
  over90days: number;
  vendorCount: number;
  highRiskVendors: number;
}

export default function PayablesAgingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Payables aging loaded from the analytics report endpoint
  const emptySummary: AgingSummary = {
    totalOutstanding: 0,
    current: 0,
    days31to60: 0,
    days61to90: 0,
    over90days: 0,
    vendorCount: 0,
    highRiskVendors: 0,
  };
  const [agingSummary, setAgingSummary] = useState<AgingSummary>(emptySummary);
  const [vendorAging, setVendorAging] = useState<VendorAging[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const { data, summary } = await FinanceService.getPayablesAging();
        const rows = Array.isArray(data) ? data : [];
        const mapped: VendorAging[] = rows.map((r: any, i: number) => {
          const days31to60 = Number(r.days31to60 ?? r.days30to60 ?? 0);
          const days61to90 = Number(r.days61to90 ?? r.days60to90 ?? 0);
          const over90days = Number(
            r.over90days ?? Number(r.days90to120 ?? 0) + Number(r.over120 ?? 0),
          );
          return {
            vendorId: r.vendorId ?? r.partyId ?? r.partyCode ?? `V-${i}`,
            vendorName: r.vendorName ?? r.partyName ?? r.name ?? '-',
            totalOutstanding: Number(r.totalOutstanding ?? r.total ?? r.outstanding ?? 0),
            current: Number(r.current ?? 0),
            days31to60,
            days61to90,
            over90days,
            creditLimit: Number(r.creditLimit ?? 0),
            paymentTerms: r.paymentTerms ?? '-',
            lastPayment: r.lastPayment ?? r.lastPaymentDate ?? '-',
            lastPaymentAmount: Number(r.lastPaymentAmount ?? 0),
            contactPerson: r.contactPerson ?? r.contact ?? '-',
            riskRating: (r.riskRating ?? 'low') as VendorAging['riskRating'],
            currency: r.currency ?? '₹',
          };
        });
        const s: AgingSummary = summary
          ? {
              totalOutstanding: Number(summary.total ?? summary.totalOutstanding ?? 0),
              current: Number(summary.current ?? 0),
              days31to60: Number(summary.days30to60 ?? summary.days31to60 ?? 0),
              days61to90: Number(summary.days60to90 ?? summary.days61to90 ?? 0),
              over90days: Number(
                summary.over90days ??
                  (Number(summary.days90to120 ?? 0) + Number(summary.over120 ?? 0)),
              ),
              vendorCount: Number(summary.partyCount ?? summary.vendorCount ?? mapped.length),
              highRiskVendors: mapped.filter((v) => v.riskRating === 'high').length,
            }
          : emptySummary;
        if (!cancelled) {
          setAgingSummary(s);
          setVendorAging(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load payables aging');
          setAgingSummary(emptySummary);
          setVendorAging([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredVendors = vendorAging.filter(vendor => {
    const matchesSearch = vendor.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.vendorId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = selectedRisk === 'all' || vendor.riskRating === selectedRisk;
    const matchesPeriod = selectedPeriod === 'all' ||
      (selectedPeriod === 'current' && vendor.current > 0) ||
      (selectedPeriod === '31-60' && vendor.days31to60 > 0) ||
      (selectedPeriod === '61-90' && vendor.days61to90 > 0) ||
      (selectedPeriod === '90+' && vendor.over90days > 0);

    return matchesSearch && matchesRisk && matchesPeriod;
  });

  const calculatePercentage = (amount: number, total: number) => {
    return total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
  };

  // Client-side CSV export from already-fetched (filtered) aging rows
  const handleExport = () => {
    const headers = ['Vendor ID', 'Vendor Name', 'Total Outstanding', 'Current (0-30)', '31-60 Days', '61-90 Days', '90+ Days', 'Credit Limit', 'Payment Terms', 'Last Payment', 'Last Payment Amount', 'Contact Person', 'Risk'];
    const rows = filteredVendors.map((v) => [
      v.vendorId, v.vendorName, v.totalOutstanding, v.current, v.days31to60, v.days61to90,
      v.over90days, v.creditLimit, v.paymentTerms, v.lastPayment, v.lastPaymentAmount,
      v.contactPerson, v.riskRating,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payables_Aging_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full h-full px-3 py-2">
          {isLoading && (
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Loading payables aging…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}
          {/* Header with Action Buttons */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Accounts Payable Aging</h1>
              </div>
              <p className="text-sm text-gray-600">Track outstanding payables by aging period</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{(agingSummary.totalOutstanding / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500 mt-1">{agingSummary.vendorCount} vendors</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-700">Current (0-30)</p>
                <ArrowDownRight className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">₹{(agingSummary.current / 1000).toFixed(0)}K</p>
              <p className="text-xs text-green-600 mt-1">{calculatePercentage(agingSummary.current, agingSummary.totalOutstanding)}% of total</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-yellow-700">31-90 Days</p>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-900">₹{((agingSummary.days31to60 + agingSummary.days61to90) / 1000).toFixed(0)}K</p>
              <p className="text-xs text-yellow-600 mt-1">{calculatePercentage(agingSummary.days31to60 + agingSummary.days61to90, agingSummary.totalOutstanding)}% of total</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">90+ Days</p>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">₹{(agingSummary.over90days / 1000).toFixed(0)}K</p>
              <p className="text-xs text-red-600 mt-1">{agingSummary.highRiskVendors} high-risk vendors</p>
            </div>
          </div>

          {/* Aging Distribution Chart */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aging Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Current (0-30 days)</span>
                  <span className="font-medium text-gray-900">₹{(agingSummary.current / 1000).toFixed(0)}K ({calculatePercentage(agingSummary.current, agingSummary.totalOutstanding)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${calculatePercentage(agingSummary.current, agingSummary.totalOutstanding)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">31-60 days</span>
                  <span className="font-medium text-gray-900">₹{(agingSummary.days31to60 / 1000).toFixed(0)}K ({calculatePercentage(agingSummary.days31to60, agingSummary.totalOutstanding)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${calculatePercentage(agingSummary.days31to60, agingSummary.totalOutstanding)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">61-90 days</span>
                  <span className="font-medium text-gray-900">₹{(agingSummary.days61to90 / 1000).toFixed(0)}K ({calculatePercentage(agingSummary.days61to90, agingSummary.totalOutstanding)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${calculatePercentage(agingSummary.days61to90, agingSummary.totalOutstanding)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Over 90 days</span>
                  <span className="font-medium text-gray-900">₹{(agingSummary.over90days / 1000).toFixed(0)}K ({calculatePercentage(agingSummary.over90days, agingSummary.totalOutstanding)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${calculatePercentage(agingSummary.over90days, agingSummary.totalOutstanding)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>

                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Periods</option>
                  <option value="current">Current (0-30)</option>
                  <option value="31-60">31-60 Days</option>
                  <option value="61-90">61-90 Days</option>
                  <option value="90+">Over 90 Days</option>
                </select>
              </div>
            </div>
          )}

          {/* Vendor Aging Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Outstanding
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      31-60 Days
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      61-90 Days
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      90+ Days
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map((vendor) => (
                    <React.Fragment key={vendor.vendorId}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => setExpandedVendor(expandedVendor === vendor.vendorId ? null : vendor.vendorId)}
                              className="mr-2"
                            >
                              {expandedVendor === vendor.vendorId ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{vendor.vendorName}</div>
                              <div className="text-xs text-gray-500">{vendor.vendorId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {vendor.currency}{(vendor.totalOutstanding / 1000).toFixed(0)}K
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <div className="text-sm text-green-600 font-medium">
                            {vendor.current > 0 ? `${vendor.currency}${(vendor.current / 1000).toFixed(0)}K` : '-'}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <div className="text-sm text-blue-600 font-medium">
                            {vendor.days31to60 > 0 ? `${vendor.currency}${(vendor.days31to60 / 1000).toFixed(0)}K` : '-'}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <div className="text-sm text-yellow-600 font-medium">
                            {vendor.days61to90 > 0 ? `${vendor.currency}${(vendor.days61to90 / 1000).toFixed(0)}K` : '-'}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <div className="text-sm text-red-600 font-medium">
                            {vendor.over90days > 0 ? `${vendor.currency}${(vendor.over90days / 1000).toFixed(0)}K` : '-'}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(vendor.riskRating)}`}>
                            {vendor.riskRating.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => setExpandedVendor(expandedVendor === vendor.vendorId ? null : vendor.vendorId)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                      {expandedVendor === vendor.vendorId && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="px-3 py-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Payment Terms</p>
                                <p className="font-medium text-gray-900">{vendor.paymentTerms}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Credit Limit</p>
                                <p className="font-medium text-gray-900">{vendor.currency}{(vendor.creditLimit / 1000).toFixed(0)}K</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Last Payment</p>
                                <p className="font-medium text-gray-900">{vendor.lastPayment}</p>
                                <p className="text-xs text-gray-500">{vendor.currency}{(vendor.lastPaymentAmount / 1000).toFixed(0)}K</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Contact Person</p>
                                <p className="font-medium text-gray-900">{vendor.contactPerson}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
