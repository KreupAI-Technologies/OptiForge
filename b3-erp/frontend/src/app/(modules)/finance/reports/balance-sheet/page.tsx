'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  Share2,
  Filter,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Building,
  CreditCard,
  PieChart,
} from 'lucide-react';
import { FinancialReportsService } from '@/services/financial-reports.service';

const INITIAL_BALANCE_SHEET_DATA = {
    assets: {
      currentAssets: {
        cash: { current: 500000, previous: 450000 },
        bankBalance: { current: 11800000, previous: 11200000 },
        accountsReceivable: { current: 8900000, previous: 8200000 },
        inventory: { current: 5500000, previous: 5200000 },
        prepaidExpenses: { current: 250000, previous: 220000 },
      },
      fixedAssets: {
        land: { current: 15000000, previous: 15000000 },
        buildings: { current: 8000000, previous: 8000000 },
        machineryEquipment: { current: 12000000, previous: 11500000 },
        vehicles: { current: 2700000, previous: 3000000 },
        furnitureFixtures: { current: 1800000, previous: 2000000 },
        accumulatedDepreciation: { current: -2500000, previous: -2375000 },
      },
      otherAssets: {
        investments: { current: 3000000, previous: 2800000 },
        intangibleAssets: { current: 1500000, previous: 1500000 },
      },
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: { current: 5600000, previous: 5200000 },
        shortTermLoans: { current: 2000000, previous: 2500000 },
        accruedExpenses: { current: 1200000, previous: 1100000 },
        taxesPayable: { current: 850000, previous: 780000 },
        gstPayable: { current: 325000, previous: 298000 },
      },
      longTermLiabilities: {
        termLoans: { current: 15000000, previous: 16000000 },
        debentures: { current: 3000000, previous: 3000000 },
        deferredTaxLiability: { current: 500000, previous: 475000 },
      },
    },
    equity: {
      shareCapital: { current: 10000000, previous: 10000000 },
      reservesAndSurplus: {
        generalReserve: { current: 5000000, previous: 4500000 },
        retainedEarnings: { current: 8425000, previous: 7050000 },
      },
    },
  };

export default function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState('2025-10-31');
  const [showComparison, setShowComparison] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'current-assets',
    'fixed-assets',
    'current-liabilities',
    'equity',
  ]);

  // Live data overlays the hardcoded seed; seed remains the render/calculation source.
  const [balanceSheetData, setBalanceSheetData] = useState(INITIAL_BALANCE_SHEET_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const end = asOfDate ? new Date(asOfDate) : new Date();
      const start = new Date(end.getFullYear(), 0, 1);
      const blob = await FinancialReportsService.exportToPdf('balance-sheet', {
        startDate: start,
        endDate: end,
        comparePeriod: showComparison,
      });
      downloadBlob(blob, `Balance_Sheet_${asOfDate || new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
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
        const live = await FinancialReportsService.getBalanceSheet({ startDate: start, endDate: end });
        if (!cancelled && live) {
          // Live shape (BalanceSheet) differs from the page's nested shape.
          // Overlay cleanly-mapping leaf balances where a section item exists; keep seed otherwise.
          setBalanceSheetData((prev) => {
            const next = {
              ...prev,
              assets: { ...prev.assets, currentAssets: { ...prev.assets.currentAssets } },
            };
            const cashItem = live.assets?.currentAssets?.items?.find((i) =>
              i.accountName?.toLowerCase().includes('cash')
            );
            if (cashItem && typeof cashItem.balance === 'number') {
              next.assets.currentAssets.cash = {
                current: cashItem.balance,
                previous:
                  typeof cashItem.previousBalance === 'number'
                    ? cashItem.previousBalance
                    : prev.assets.currentAssets.cash.previous,
              };
            }
            const receivableItem = live.assets?.currentAssets?.items?.find((i) =>
              i.accountName?.toLowerCase().includes('receivable')
            );
            if (receivableItem && typeof receivableItem.balance === 'number') {
              next.assets.currentAssets.accountsReceivable = {
                current: receivableItem.balance,
                previous:
                  typeof receivableItem.previousBalance === 'number'
                    ? receivableItem.previousBalance
                    : prev.assets.currentAssets.accountsReceivable.previous,
              };
            }
            return next;
          });
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

  const calculateTotal = (obj: any): { current: number; previous: number } => {
    let current = 0;
    let previous = 0;

    Object.values(obj).forEach((item: any) => {
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

  const totalCurrentAssets = calculateTotal(balanceSheetData.assets.currentAssets);
  const totalFixedAssets = calculateTotal(balanceSheetData.assets.fixedAssets);
  const totalOtherAssets = calculateTotal(balanceSheetData.assets.otherAssets);
  const totalAssets = {
    current: totalCurrentAssets.current + totalFixedAssets.current + totalOtherAssets.current,
    previous: totalCurrentAssets.previous + totalFixedAssets.previous + totalOtherAssets.previous,
  };

  const totalCurrentLiabilities = calculateTotal(balanceSheetData.liabilities.currentLiabilities);
  const totalLongTermLiabilities = calculateTotal(balanceSheetData.liabilities.longTermLiabilities);
  const totalLiabilities = {
    current: totalCurrentLiabilities.current + totalLongTermLiabilities.current,
    previous: totalCurrentLiabilities.previous + totalLongTermLiabilities.previous,
  };

  const totalEquity = calculateTotal(balanceSheetData.equity);
  const totalLiabilitiesAndEquity = {
    current: totalLiabilities.current + totalEquity.current,
    previous: totalLiabilities.previous + totalEquity.previous,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const renderLineItem = (
    label: string,
    current: number,
    previous: number,
    isSubtotal: boolean = false,
    isTotal: boolean = false,
    indent: number = 0
  ) => {
    const change = calculateChange(current, previous);
    const textClass = isTotal
      ? 'text-lg font-bold text-gray-900'
      : isSubtotal
      ? 'font-bold text-gray-900'
      : 'text-gray-700';
    const bgClass = isTotal
      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-t-2 border-b-2 border-blue-300'
      : isSubtotal
      ? 'bg-gray-50 border-t border-b border-gray-300'
      : '';

    return (
      <tr key={label} className={`${bgClass} hover:bg-gray-50 transition-colors`}>
        <td className="px-3 py-2" style={{ paddingLeft: `${1.5 + indent * 1.5}rem` }}>
          <span className={textClass}>{label}</span>
        </td>
        <td className={`px-3 py-2 text-right ${textClass}`}>
          {formatCurrency(current)}
        </td>
        {showComparison && (
          <>
            <td className={`px-3 py-2 text-right ${textClass}`}>
              {formatCurrency(previous)}
            </td>
            <td className={`px-3 py-2 text-right ${textClass}`}>
              {formatCurrency(current - previous)}
            </td>
            <td className="px-3 py-2 text-right">
              <span
                className={`font-semibold ${
                  change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {change > 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
            </td>
          </>
        )}
      </tr>
    );
  };

  const renderExpandableSection: any = (
    title: string,
    sectionKey: string,
    items: any,
    indent: number = 0
  ) => {
    const isExpanded = expandedSections.includes(sectionKey);
    const total = calculateTotal(items);

    return (
      <>
        <tr className="bg-gray-100 border-t-2 border-gray-300">
          <td className="px-3 py-2" style={{ paddingLeft: `${1.5 + indent * 1.5}rem` }}>
            <button
              onClick={() => toggleSection(sectionKey)}
              className="flex items-center gap-2 font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {title}
            </button>
          </td>
          <td className="px-3 py-2 text-right font-bold text-gray-900">
            {formatCurrency(total.current)}
          </td>
          {showComparison && (
            <>
              <td className="px-3 py-2 text-right font-bold text-gray-900">
                {formatCurrency(total.previous)}
              </td>
              <td className="px-3 py-2 text-right font-bold text-gray-900">
                {formatCurrency(total.current - total.previous)}
              </td>
              <td className="px-3 py-2 text-right">
                <span
                  className={`font-bold ${
                    calculateChange(total.current, total.previous) > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {calculateChange(total.current, total.previous) > 0 ? '+' : ''}
                  {calculateChange(total.current, total.previous).toFixed(1)}%
                </span>
              </td>
            </>
          )}
        </tr>
        {isExpanded &&
          Object.entries(items).map(([key, value]: [string, any]) => {
            if (value.current !== undefined) {
              return renderLineItem(
                key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
                value.current,
                value.previous,
                false,
                false,
                indent + 1
              );
            } else {
              return renderExpandableSection(
                key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
                `${sectionKey}-${key}`,
                value,
                indent + 1
              );
            }
          })}
      </>
    );
  };

  // Financial Ratios
  const currentRatio = totalCurrentAssets.current / totalCurrentLiabilities.current;
  const quickRatio =
    (totalCurrentAssets.current - balanceSheetData.assets.currentAssets.inventory.current) /
    totalCurrentLiabilities.current;
  const debtToEquityRatio = totalLiabilities.current / totalEquity.current;
  const workingCapital = totalCurrentAssets.current - totalCurrentLiabilities.current;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Balance Sheet
            </h1>
            <p className="text-gray-600 mt-1">Statement of financial position</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-5 h-5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-blue-100 text-sm mb-1">Total Assets</p>
            <p className="text-3xl font-bold">{formatCurrency(totalAssets.current)}</p>
            <p className="text-sm text-blue-100 mt-2">
              {calculateChange(totalAssets.current, totalAssets.previous) > 0 ? '+' : ''}
              {calculateChange(totalAssets.current, totalAssets.previous).toFixed(1)}% vs previous
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-red-100 text-sm mb-1">Total Liabilities</p>
            <p className="text-3xl font-bold">{formatCurrency(totalLiabilities.current)}</p>
            <p className="text-sm text-red-100 mt-2">
              Debt/Equity: {debtToEquityRatio.toFixed(2)}x
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-purple-100 text-sm mb-1">Total Equity</p>
            <p className="text-3xl font-bold">{formatCurrency(totalEquity.current)}</p>
            <p className="text-sm text-purple-100 mt-2">
              {((totalEquity.current / totalAssets.current) * 100).toFixed(1)}% of Assets
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-green-100 text-sm mb-1">Working Capital</p>
            <p className="text-3xl font-bold">{formatCurrency(workingCapital)}</p>
            <p className="text-sm text-green-100 mt-2">
              Current Ratio: {currentRatio.toFixed(2)}x
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Report Options</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">As of Date</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comparison</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Previous Period</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Sheet Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Balance Sheet</h2>
              <p className="text-blue-100 mt-1">As of {asOfDate}</p>
            </div>
            <Building className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase">
                  Account
                </th>
                <th className="px-3 py-2 text-right text-sm font-bold text-gray-700 uppercase">
                  Current
                </th>
                {showComparison && (
                  <>
                    <th className="px-3 py-2 text-right text-sm font-bold text-gray-700 uppercase">
                      Previous
                    </th>
                    <th className="px-3 py-2 text-right text-sm font-bold text-gray-700 uppercase">
                      Change
                    </th>
                    <th className="px-3 py-2 text-right text-sm font-bold text-gray-700 uppercase">
                      %
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* ASSETS */}
              <tr className="bg-blue-600 text-white">
                <td colSpan={showComparison ? 5 : 2} className="px-3 py-2 font-bold text-lg">
                  ASSETS
                </td>
              </tr>

              {renderExpandableSection(
                'Current Assets',
                'current-assets',
                balanceSheetData.assets.currentAssets
              )}
              {renderLineItem('Total Current Assets', totalCurrentAssets.current, totalCurrentAssets.previous, true)}

              {renderExpandableSection('Fixed Assets', 'fixed-assets', balanceSheetData.assets.fixedAssets)}
              {renderLineItem('Total Fixed Assets', totalFixedAssets.current, totalFixedAssets.previous, true)}

              {renderExpandableSection('Other Assets', 'other-assets', balanceSheetData.assets.otherAssets)}
              {renderLineItem('Total Other Assets', totalOtherAssets.current, totalOtherAssets.previous, true)}

              {renderLineItem('TOTAL ASSETS', totalAssets.current, totalAssets.previous, false, true)}

              {/* LIABILITIES */}
              <tr className="bg-red-600 text-white">
                <td colSpan={showComparison ? 5 : 2} className="px-3 py-2 font-bold text-lg">
                  LIABILITIES
                </td>
              </tr>

              {renderExpandableSection(
                'Current Liabilities',
                'current-liabilities',
                balanceSheetData.liabilities.currentLiabilities
              )}
              {renderLineItem(
                'Total Current Liabilities',
                totalCurrentLiabilities.current,
                totalCurrentLiabilities.previous,
                true
              )}

              {renderExpandableSection(
                'Long-term Liabilities',
                'long-term-liabilities',
                balanceSheetData.liabilities.longTermLiabilities
              )}
              {renderLineItem(
                'Total Long-term Liabilities',
                totalLongTermLiabilities.current,
                totalLongTermLiabilities.previous,
                true
              )}

              {renderLineItem('TOTAL LIABILITIES', totalLiabilities.current, totalLiabilities.previous, false, true)}

              {/* EQUITY */}
              <tr className="bg-purple-600 text-white">
                <td colSpan={showComparison ? 5 : 2} className="px-3 py-2 font-bold text-lg">
                  SHAREHOLDERS' EQUITY
                </td>
              </tr>

              {renderLineItem(
                'Share Capital',
                balanceSheetData.equity.shareCapital.current,
                balanceSheetData.equity.shareCapital.previous
              )}
              {renderExpandableSection('Reserves & Surplus', 'equity', balanceSheetData.equity.reservesAndSurplus, 0)}

              {renderLineItem('TOTAL EQUITY', totalEquity.current, totalEquity.previous, false, true)}

              {/* TOTAL LIABILITIES & EQUITY */}
              {renderLineItem(
                'TOTAL LIABILITIES & EQUITY',
                totalLiabilitiesAndEquity.current,
                totalLiabilitiesAndEquity.previous,
                false,
                true
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Ratios */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-t-2 border-gray-300">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Financial Ratios & Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Current Ratio</p>
              <p className="text-2xl font-bold text-green-600">{currentRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Current Assets / Current Liabilities</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Quick Ratio</p>
              <p className="text-2xl font-bold text-blue-600">{quickRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">(Current Assets - Inventory) / Current Liabilities</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Debt to Equity</p>
              <p className="text-2xl font-bold text-orange-600">{debtToEquityRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Total Liabilities / Total Equity</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Equity Ratio</p>
              <p className="text-2xl font-bold text-purple-600">
                {((totalEquity.current / totalAssets.current) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Equity / Total Assets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
