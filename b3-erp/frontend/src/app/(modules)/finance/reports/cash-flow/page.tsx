'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  Printer,
  Share2,
  ChevronDown,
  ChevronRight,
  Filter,
  Calendar
} from 'lucide-react';
import { FinancialReportsService } from '@/services/financial-reports.service';

interface CashFlowItem {
  current: number;
  previous: number;
}

interface CashFlowSection {
  [key: string]: CashFlowItem | CashFlowSection;
}

export default function CashFlowStatementPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showComparison, setShowComparison] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    operating: true,
    investing: true,
    financing: true
  });

  // Sample cash flow data (seed; live data overlays top-level opening cash where available)
  const INITIAL_CASH_FLOW_DATA = {
    operating: {
      netProfit: { current: 8500000, previous: 7200000 },
      adjustments: {
        depreciation: { current: 1200000, previous: 1100000 },
        amortization: { current: 300000, previous: 250000 },
        interestExpense: { current: 450000, previous: 400000 },
        gainOnSaleOfAssets: { current: -150000, previous: -100000 },
        provisionForDoubtfulDebts: { current: 200000, previous: 180000 }
      },
      workingCapitalChanges: {
        inventoryDecrease: { current: -800000, previous: 600000 },
        accountsReceivableDecrease: { current: -1200000, previous: -500000 },
        accountsPayableIncrease: { current: 900000, previous: 400000 },
        prepaidExpensesDecrease: { current: 100000, previous: 50000 },
        accruedExpensesIncrease: { current: 300000, previous: 200000 }
      },
      interestPaid: { current: -450000, previous: -400000 },
      taxesPaid: { current: -2100000, previous: -1800000 }
    },
    investing: {
      purchaseOfFixedAssets: { current: -3500000, previous: -2800000 },
      saleOfFixedAssets: { current: 500000, previous: 300000 },
      purchaseOfInvestments: { current: -1000000, previous: -800000 },
      saleOfInvestments: { current: 200000, previous: 150000 },
      interestReceived: { current: 150000, previous: 120000 },
      dividendReceived: { current: 80000, previous: 60000 }
    },
    financing: {
      proceedsFromLongTermLoans: { current: 2000000, previous: 1500000 },
      repaymentOfLongTermLoans: { current: -1500000, previous: -1200000 },
      proceedsFromShortTermLoans: { current: 500000, previous: 300000 },
      repaymentOfShortTermLoans: { current: -300000, previous: -200000 },
      dividendsPaid: { current: -1200000, previous: -1000000 },
      interestOnLoans: { current: -200000, previous: -180000 }
    }
  };

  const [cashFlowData, setCashFlowData] = useState(INITIAL_CASH_FLOW_DATA);
  const [openingCash, setOpeningCash] = useState({ current: 5200000, previous: 4100000 });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const resolvePeriodRange = (): { startDate: Date; endDate: Date } => {
    const end = new Date();
    let start = new Date(end.getFullYear(), 0, 1);
    switch (selectedPeriod) {
      case 'current-month':
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case 'current-quarter':
        start = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
        break;
      case 'last-month':
        start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
        break;
      case 'last-year':
        start = new Date(end.getFullYear() - 1, 0, 1);
        break;
      default:
        start = new Date(end.getFullYear(), 0, 1);
    }
    return { startDate: start, endDate: end };
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const range = resolvePeriodRange();
      const blob = await FinancialReportsService.exportToExcel('cash-flow', {
        startDate: range.startDate,
        endDate: range.endDate,
        comparePeriod: showComparison,
      });
      const dateStr = new Date().toISOString().split('T')[0];
      downloadBlob(blob, `Cash_Flow_Statement_${selectedPeriod}_${dateStr}.xlsx`);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const end = new Date();
        const start = new Date(end.getFullYear(), 0, 1);
        const live = await FinancialReportsService.getCashFlow({ startDate: start, endDate: end });
        if (!cancelled && live) {
          // Live CashFlow shape differs from the nested seed used by the table.
          // Overlay the beginning/opening cash total, which maps cleanly.
          if (typeof live.beginningCash === 'number') {
            setOpeningCash({
              current: live.beginningCash,
              previous:
                typeof live.previousBeginningCash === 'number'
                  ? live.previousBeginningCash
                  : live.beginningCash,
            });
          }
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateTotal = (section: CashFlowSection): { current: number; previous: number } => {
    let current = 0;
    let previous = 0;

    Object.values(section).forEach((item: any) => {
      if (item.current !== undefined) {
        current += item.current;
        previous += item.previous;
      } else {
        const nested = calculateTotal(item);
        current += nested.current;
        previous += nested.previous;
      }
    });

    return { current, previous };
  };

  const operatingTotal = calculateTotal(cashFlowData.operating);
  const investingTotal = calculateTotal(cashFlowData.investing);
  const financingTotal = calculateTotal(cashFlowData.financing);

  const netCashFlow = {
    current: operatingTotal.current + investingTotal.current + financingTotal.current,
    previous: operatingTotal.previous + investingTotal.previous + financingTotal.previous
  };

  const closingCash = {
    current: openingCash.current + netCashFlow.current,
    previous: openingCash.previous + netCashFlow.previous
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatVariance = (current: number, previous: number) => {
    if (previous === 0) return 'N/A';
    const variance = ((current - previous) / Math.abs(previous)) * 100;
    return `${variance >= 0 ? '+' : ''}${variance.toFixed(1)}%`;
  };

  const renderCashFlowRow = (label: string, data: CashFlowItem, isSubItem = false, isTotal = false) => {
    const isNegative = data.current < 0;
    const variance = data.previous !== 0 ? ((data.current - data.previous) / Math.abs(data.previous)) * 100 : 0;

    return (
      <tr className={`border-b border-gray-700 ${isTotal ? 'bg-gray-800 font-bold' : 'hover:bg-gray-800/50'}`}>
        <td className={`px-3 py-2 ${isSubItem ? 'pl-12' : ''} ${isTotal ? 'text-white' : 'text-gray-300'}`}>
          {label}
        </td>
        <td className={`px-3 py-2 text-right ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
          {isNegative && '('}{formatCurrency(data.current)}{isNegative && ')'}
        </td>
        {showComparison && (
          <>
            <td className={`px-3 py-2 text-right ${data.previous < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {data.previous < 0 && '('}{formatCurrency(data.previous)}{data.previous < 0 && ')'}
            </td>
            <td className={`px-3 py-2 text-right ${variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatVariance(data.current, data.previous)}
            </td>
          </>
        )}
      </tr>
    );
  };

  const renderSubSection = (title: string, data: CashFlowSection) => {
    const total = calculateTotal(data);
    return (
      <>
        <tr className="bg-gray-800/50">
          <td className="px-6 py-2 pl-8 text-gray-400 font-semibold" colSpan={showComparison ? 4 : 2}>
            {title}
          </td>
        </tr>
        {Object.entries(data).map(([key, value]) => {
          if ('current' in value) {
            return renderCashFlowRow(
              key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
              value as CashFlowItem,
              true
            );
          }
          return null;
        })}
        {renderCashFlowRow(`Total ${title}`, total, false, false)}
      </>
    );
  };

  // Calculate cash flow ratios
  const operatingCashFlowRatio = (operatingTotal.current / 12500000) * 100; // Assuming current liabilities of 12.5M
  const cashFlowMargin = (operatingTotal.current / 45000000) * 100; // Assuming revenue of 45M
  const freeCashFlow = operatingTotal.current + investingTotal.current;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-3">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cash Flow Statement</h1>
            <p className="text-gray-400">Cash inflows and outflows analysis</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(operatingTotal.current)}</div>
            <div className="text-green-100 text-sm">Operating Activities</div>
            <div className="mt-2 text-xs text-green-100">
              {formatVariance(operatingTotal.current, operatingTotal.previous)} vs last period
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {investingTotal.current < 0 && '('}{formatCurrency(investingTotal.current)}{investingTotal.current < 0 && ')'}
            </div>
            <div className="text-orange-100 text-sm">Investing Activities</div>
            <div className="mt-2 text-xs text-orange-100">
              {formatVariance(investingTotal.current, investingTotal.previous)} vs last period
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {financingTotal.current < 0 && '('}{formatCurrency(financingTotal.current)}{financingTotal.current < 0 && ')'}
            </div>
            <div className="text-purple-100 text-sm">Financing Activities</div>
            <div className="mt-2 text-xs text-purple-100">
              {formatVariance(financingTotal.current, financingTotal.previous)} vs last period
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(netCashFlow.current)}</div>
            <div className="text-blue-100 text-sm">Net Cash Flow</div>
            <div className="mt-2 text-xs text-blue-100">
              {formatVariance(netCashFlow.current, netCashFlow.previous)} vs last period
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current-month">Current Month</option>
                <option value="current-quarter">Current Quarter</option>
                <option value="current-year">Current Year</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Period</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                Show Comparison
              </label>
            </div>
          </div>
        </div>

        {/* Cash Flow Statement */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Particulars</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Current Period</th>
                  {showComparison && (
                    <>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Previous Period</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Variance</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Operating Activities */}
                <tr className="bg-green-900/20 border-b-2 border-green-600">
                  <td
                    className="px-3 py-2 font-bold text-green-400 cursor-pointer flex items-center gap-2"
                    onClick={() => toggleSection('operating')}
                  >
                    {expandedSections.operating ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    Cash Flow from Operating Activities
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-green-400">
                    {formatCurrency(operatingTotal.current)}
                  </td>
                  {showComparison && (
                    <>
                      <td className="px-3 py-2 text-right font-bold text-green-400">
                        {formatCurrency(operatingTotal.previous)}
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${
                        (operatingTotal.current - operatingTotal.previous) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatVariance(operatingTotal.current, operatingTotal.previous)}
                      </td>
                    </>
                  )}
                </tr>
                {expandedSections.operating && (
                  <>
                    {renderCashFlowRow('Net Profit Before Tax', cashFlowData.operating.netProfit, true)}
                    {renderSubSection('Adjustments for Non-Cash Items', cashFlowData.operating.adjustments)}
                    {renderSubSection('Working Capital Changes', cashFlowData.operating.workingCapitalChanges)}
                    {renderCashFlowRow('Interest Paid', cashFlowData.operating.interestPaid, true)}
                    {renderCashFlowRow('Income Tax Paid', cashFlowData.operating.taxesPaid, true)}
                  </>
                )}

                {/* Investing Activities */}
                <tr className="bg-orange-900/20 border-b-2 border-orange-600">
                  <td
                    className="px-3 py-2 font-bold text-orange-400 cursor-pointer flex items-center gap-2"
                    onClick={() => toggleSection('investing')}
                  >
                    {expandedSections.investing ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    Cash Flow from Investing Activities
                  </td>
                  <td className={`px-3 py-2 text-right font-bold ${investingTotal.current < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {investingTotal.current < 0 && '('}{formatCurrency(investingTotal.current)}{investingTotal.current < 0 && ')'}
                  </td>
                  {showComparison && (
                    <>
                      <td className={`px-3 py-2 text-right font-bold ${investingTotal.previous < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {investingTotal.previous < 0 && '('}{formatCurrency(investingTotal.previous)}{investingTotal.previous < 0 && ')'}
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${
                        (investingTotal.current - investingTotal.previous) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatVariance(investingTotal.current, investingTotal.previous)}
                      </td>
                    </>
                  )}
                </tr>
                {expandedSections.investing && (
                  <>
                    {renderCashFlowRow('Purchase of Fixed Assets', cashFlowData.investing.purchaseOfFixedAssets, true)}
                    {renderCashFlowRow('Sale of Fixed Assets', cashFlowData.investing.saleOfFixedAssets, true)}
                    {renderCashFlowRow('Purchase of Investments', cashFlowData.investing.purchaseOfInvestments, true)}
                    {renderCashFlowRow('Sale of Investments', cashFlowData.investing.saleOfInvestments, true)}
                    {renderCashFlowRow('Interest Received', cashFlowData.investing.interestReceived, true)}
                    {renderCashFlowRow('Dividend Received', cashFlowData.investing.dividendReceived, true)}
                  </>
                )}

                {/* Financing Activities */}
                <tr className="bg-purple-900/20 border-b-2 border-purple-600">
                  <td
                    className="px-3 py-2 font-bold text-purple-400 cursor-pointer flex items-center gap-2"
                    onClick={() => toggleSection('financing')}
                  >
                    {expandedSections.financing ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    Cash Flow from Financing Activities
                  </td>
                  <td className={`px-3 py-2 text-right font-bold ${financingTotal.current < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {financingTotal.current < 0 && '('}{formatCurrency(financingTotal.current)}{financingTotal.current < 0 && ')'}
                  </td>
                  {showComparison && (
                    <>
                      <td className={`px-3 py-2 text-right font-bold ${financingTotal.previous < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {financingTotal.previous < 0 && '('}{formatCurrency(financingTotal.previous)}{financingTotal.previous < 0 && ')'}
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${
                        (financingTotal.current - financingTotal.previous) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatVariance(financingTotal.current, financingTotal.previous)}
                      </td>
                    </>
                  )}
                </tr>
                {expandedSections.financing && (
                  <>
                    {renderCashFlowRow('Proceeds from Long-term Loans', cashFlowData.financing.proceedsFromLongTermLoans, true)}
                    {renderCashFlowRow('Repayment of Long-term Loans', cashFlowData.financing.repaymentOfLongTermLoans, true)}
                    {renderCashFlowRow('Proceeds from Short-term Loans', cashFlowData.financing.proceedsFromShortTermLoans, true)}
                    {renderCashFlowRow('Repayment of Short-term Loans', cashFlowData.financing.repaymentOfShortTermLoans, true)}
                    {renderCashFlowRow('Dividends Paid', cashFlowData.financing.dividendsPaid, true)}
                    {renderCashFlowRow('Interest on Loans', cashFlowData.financing.interestOnLoans, true)}
                  </>
                )}

                {/* Net Cash Flow */}
                <tr className="bg-blue-900/20 border-b-2 border-blue-600">
                  <td className="px-3 py-2 font-bold text-blue-400">Net Increase/(Decrease) in Cash</td>
                  <td className={`px-3 py-2 text-right font-bold ${netCashFlow.current < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {netCashFlow.current < 0 && '('}{formatCurrency(netCashFlow.current)}{netCashFlow.current < 0 && ')'}
                  </td>
                  {showComparison && (
                    <>
                      <td className={`px-3 py-2 text-right font-bold ${netCashFlow.previous < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {netCashFlow.previous < 0 && '('}{formatCurrency(netCashFlow.previous)}{netCashFlow.previous < 0 && ')'}
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${
                        (netCashFlow.current - netCashFlow.previous) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatVariance(netCashFlow.current, netCashFlow.previous)}
                      </td>
                    </>
                  )}
                </tr>

                {/* Opening & Closing Cash */}
                {renderCashFlowRow('Add: Opening Cash & Cash Equivalents', openingCash)}
                <tr className="bg-gray-900/50 border-t-2 border-gray-600">
                  <td className="px-3 py-2 font-bold text-white text-lg">Closing Cash & Cash Equivalents</td>
                  <td className="px-3 py-2 text-right font-bold text-white text-lg">
                    {formatCurrency(closingCash.current)}
                  </td>
                  {showComparison && (
                    <>
                      <td className="px-3 py-2 text-right font-bold text-white text-lg">
                        {formatCurrency(closingCash.previous)}
                      </td>
                      <td className={`px-3 py-2 text-right font-bold text-lg ${
                        (closingCash.current - closingCash.previous) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatVariance(closingCash.current, closingCash.previous)}
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash Flow Ratios */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-2">Cash Flow Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Operating Cash Flow Ratio</div>
              <div className="text-2xl font-bold text-white mb-1">{operatingCashFlowRatio.toFixed(2)}%</div>
              <div className="text-xs text-gray-500">Operating CF / Current Liabilities</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Cash Flow Margin</div>
              <div className="text-2xl font-bold text-white mb-1">{cashFlowMargin.toFixed(2)}%</div>
              <div className="text-xs text-gray-500">Operating CF / Revenue</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Free Cash Flow</div>
              <div className="text-2xl font-bold text-white mb-1">{formatCurrency(freeCashFlow)}</div>
              <div className="text-xs text-gray-500">Operating CF + Investing CF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
