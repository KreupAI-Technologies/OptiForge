'use client';

import React, { useState, useEffect } from 'react';
import { FinanceService } from '@/services/finance.service';
import {
  Plus,
  Calendar,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  AlertCircle,
  Clock,
  TrendingUp,
  FileText,
  Settings,
  ChevronRight,
  Package,
  DollarSign,
  Calculator,
  Users,
  Save,
  X,
} from 'lucide-react';

interface FinancialYear {
  id: string;
  yearCode: string;
  yearName: string;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Closed' | 'Locked';
  isCurrent: boolean;
  periodsCount: number;
  openPeriodsCount: number;
}

interface FinancialPeriod {
  id: string;
  periodCode: string;
  periodName: string;
  yearCode: string;
  periodType: 'Month' | 'Quarter' | 'Half Year' | 'Year';
  periodNumber: number;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Closed' | 'Locked';
  isCurrent: boolean;
  transactionsCount: number;
}

interface ChecklistItem {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'in-progress' | 'not-started';
  icon: any;
}

export default function FinancialPeriodsPage() {
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState('');

  const normalizeStatus = (s: any): 'Open' | 'Closed' | 'Locked' => {
    const v = String(s || '').toLowerCase();
    if (v.includes('lock')) return 'Locked';
    if (v.includes('close')) return 'Closed';
    return 'Open';
  };

  const normalizePeriodType = (t: any): FinancialPeriod['periodType'] => {
    const v = String(t || '').toLowerCase();
    if (v.includes('quarter')) return 'Quarter';
    if (v.includes('half')) return 'Half Year';
    if (v.includes('year') || v.includes('annual')) return 'Year';
    return 'Month';
  };

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [processingPeriod, setProcessingPeriod] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      {
        const [rawYears, rawPeriods] = await Promise.all([
          FinanceService.getFinancialYears(),
          FinanceService.getFinancialPeriods(),
        ]);

        const periodsList = Array.isArray(rawPeriods) ? rawPeriods : [];

        const years: FinancialYear[] = (Array.isArray(rawYears) ? rawYears : []).map((y: any) => {
          const yearPeriods = periodsList.filter(
            (p: any) => p.financialYearId === y.id,
          );
          const openCount = yearPeriods.filter(
            (p: any) => normalizeStatus(p.status) === 'Open',
          ).length;
          return {
            id: String(y.id),
            yearCode: String(y.yearCode ?? ''),
            yearName: String(y.yearName ?? y.yearCode ?? ''),
            startDate: String(y.startDate ?? ''),
            endDate: String(y.endDate ?? ''),
            status: normalizeStatus(y.status),
            isCurrent: Boolean(y.isCurrent),
            periodsCount: yearPeriods.length,
            openPeriodsCount: openCount,
          };
        });

        const yearCodeById = new Map<string, string>(
          years.map((y) => [y.id, y.yearCode]),
        );

        const mappedPeriods: FinancialPeriod[] = periodsList.map((p: any) => ({
          id: String(p.id),
          periodCode: String(p.periodCode ?? ''),
          periodName: String(p.periodName ?? p.periodCode ?? ''),
          yearCode: yearCodeById.get(String(p.financialYearId)) ?? String(p.financialYearId ?? ''),
          periodType: normalizePeriodType(p.periodType),
          periodNumber: Number(p.periodNumber) || 0,
          startDate: String(p.startDate ?? ''),
          endDate: String(p.endDate ?? ''),
          status: normalizeStatus(p.status),
          isCurrent: Boolean(p.isCurrent),
          transactionsCount: Number(p.transactionsCount ?? 0) || 0,
        }));

        setFinancialYears(years);
        setPeriods(mappedPeriods);

        const current = years.find((y) => y.isCurrent) ?? years[0];
        if (current) setSelectedYear((prev) => prev || current.yearCode);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load financial periods');
      setFinancialYears([]);
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showAccrualsModal, setShowAccrualsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [newYear, setNewYear] = useState({ yearCode: '', yearName: '', startDate: '', endDate: '' });
  const [creatingYear, setCreatingYear] = useState(false);
  const [detailYear, setDetailYear] = useState<FinancialYear | null>(null);
  const [detailPeriod, setDetailPeriod] = useState<FinancialPeriod | null>(null);

  const handleCreateYear = async () => {
    if (!newYear.yearCode || !newYear.startDate || !newYear.endDate) {
      setActionMessage({ type: 'error', text: 'Year code, start date and end date are required.' });
      return;
    }
    setCreatingYear(true);
    setActionMessage(null);
    try {
      await FinanceService.createFinancialYear({
        yearCode: newYear.yearCode,
        yearName: newYear.yearName || newYear.yearCode,
        startDate: newYear.startDate,
        endDate: newYear.endDate,
      });
      setShowNewYearModal(false);
      setNewYear({ yearCode: '', yearName: '', startDate: '', endDate: '' });
      setActionMessage({ type: 'success', text: `Financial year ${newYear.yearCode} created.` });
      await loadData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create financial year.' });
    } finally {
      setCreatingYear(false);
    }
  };

  const [checklistStatus, setChecklistStatus] = useState({
    inventoryValuation: 'pending' as string,
    accrualsProvisions: 'not-started' as string,
    managementReview: 'pending' as string,
  });
  const [checklistPeriodId, setChecklistPeriodId] = useState<string | null>(null);

  const currentYear = financialYears.find((y) => y.yearCode === selectedYear);
  const yearPeriods = periods.filter((p) => p.yearCode === selectedYear);

  // The period whose close-checklist we manage: the current period of the
  // selected year, else its first period.
  const checklistPeriod =
    yearPeriods.find((p) => p.isCurrent) ?? yearPeriods[0] ?? null;

  // Load the backend period-close checklist for the active period and map the
  // three interactive steps into local status.
  const loadChecklist = React.useCallback(async (periodId: string): Promise<void> => {
    try {
      const res = await FinanceService.getPeriodCloseChecklist(periodId);
      const steps: any[] = Array.isArray(res?.steps) ? res.steps : [];
      const byKey = new Map(steps.map((s) => [s.stepKey, s.status]));
      setChecklistStatus({
        inventoryValuation: byKey.get('inventory_valuation') ?? 'pending',
        accrualsProvisions: byKey.get('accruals_provisions') ?? 'not-started',
        managementReview: byKey.get('management_review') ?? 'pending',
      });
      setChecklistPeriodId(periodId);
    } catch {
      // Non-fatal: keep default local status if the checklist can't be loaded.
    }
  }, []);

  useEffect(() => {
    if (checklistPeriod?.id) {
      void loadChecklist(checklistPeriod.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistPeriod?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Closed':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Locked':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <Unlock className="w-4 h-4" />;
      case 'Closed':
        return <Lock className="w-4 h-4" />;
      case 'Locked':
        return <Lock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Mark a checklist step completed on the backend, then refresh + close modal.
  const completeChecklistStep = async (
    stepKey: string,
    closeModal: () => void,
    successText: string,
  ): Promise<void> => {
    if (!checklistPeriodId) {
      setActionMessage({ type: 'error', text: 'No financial period selected for the checklist.' });
      return;
    }
    try {
      await FinanceService.updatePeriodCloseStep(checklistPeriodId, stepKey, {
        status: 'completed',
      });
      await loadChecklist(checklistPeriodId);
      closeModal();
      setActionMessage({ type: 'success', text: successText });
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update checklist step.' });
    }
  };

  const handleInventoryValuation = () =>
    completeChecklistStep('inventory_valuation', () => setShowInventoryModal(false), 'Inventory valuation marked complete.');

  const handleAccrualsProvisions = () =>
    completeChecklistStep('accruals_provisions', () => setShowAccrualsModal(false), 'Accruals and provisions marked complete.');

  const handleManagementReview = () =>
    completeChecklistStep('management_review', () => setShowReviewModal(false), 'Management review marked complete.');

  // Close/open a period. No dedicated close endpoint exists, so we PATCH the
  // status via updateFinancialPeriod (status enum: Open | Closed | Locked).
  const handleSetPeriodStatus = async (
    period: FinancialPeriod,
    newStatus: 'Open' | 'Closed',
  ) => {
    const verb = newStatus === 'Closed' ? 'close' : 'reopen';
    if (!confirm(`Are you sure you want to ${verb} period "${period.periodName}"?`)) return;

    setProcessingPeriod(period.id);
    setActionMessage(null);
    try {
      await FinanceService.updateFinancialPeriod(period.id, { status: newStatus });
      setActionMessage({ type: 'success', text: `Period "${period.periodName}" ${newStatus === 'Closed' ? 'closed' : 'reopened'}.` });
      await loadData();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : `Failed to ${verb} period.`,
      });
    } finally {
      setProcessingPeriod(null);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2">
          {/* Action Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-end mb-2">
              <div className="flex items-center gap-3">
                {loading && <span className="text-sm text-gray-500">Loading…</span>}
                {error && <span className="text-sm text-red-600">{error}</span>}
                {actionMessage && (
                  <span
                    className={`text-sm ${
                      actionMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {actionMessage.text}
                  </span>
                )}
                <button
                  onClick={() => setShowNewYearModal(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">New Financial Year</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-100 text-sm">Active Financial Years</p>
                  <Calendar className="w-8 h-8 text-purple-200" />
                </div>
                <p className="text-3xl font-bold">{financialYears.filter((y) => y.status === 'Open').length}</p>
                <p className="text-sm text-purple-100 mt-2">Out of {financialYears.length} total</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-sm">Open Periods</p>
                  <Unlock className="w-8 h-8 text-green-200" />
                </div>
                <p className="text-3xl font-bold">{periods.filter((p) => p.status === 'Open').length}</p>
                <p className="text-sm text-green-100 mt-2">Current period: {periods.find((p) => p.isCurrent)?.periodName}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-sm">Closed Periods</p>
                  <Lock className="w-8 h-8 text-blue-200" />
                </div>
                <p className="text-3xl font-bold">{periods.filter((p) => p.status === 'Closed').length}</p>
                <p className="text-sm text-blue-100 mt-2">Locked for editing</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-sm">Total Transactions</p>
                  <FileText className="w-8 h-8 text-orange-200" />
                </div>
                <p className="text-3xl font-bold">{periods.reduce((sum, p) => sum + p.transactionsCount, 0)}</p>
                <p className="text-sm text-orange-100 mt-2">Across all periods</p>
              </div>
            </div>
          </div>

          {/* Financial Years Section */}
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Financial Years
              </h2>
            </div>

            <div className="space-y-3">
              {financialYears.map((year) => (
                <div
                  key={year.id}
                  className={`border-2 rounded-xl p-3 transition-all cursor-pointer ${selectedYear === year.yearCode
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                    }`}
                  onClick={() => setSelectedYear(year.yearCode)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${year.isCurrent ? 'bg-purple-600' : 'bg-gray-400'
                        }`}>
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">{year.yearName}</h3>
                          {year.isCurrent && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {year.yearCode} • {year.startDate} to {year.endDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{year.periodsCount}</p>
                        <p className="text-xs text-gray-500">Total Periods</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{year.openPeriodsCount}</p>
                        <p className="text-xs text-gray-500">Open</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{year.periodsCount - year.openPeriodsCount}</p>
                        <p className="text-xs text-gray-500">Closed</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                          year.status
                        )}`}
                      >
                        {getStatusIcon(year.status)}
                        {year.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetailYear(year); }}
                          title="View Year Details"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedYear(year.yearCode); setDetailYear(year); }}
                          title="Manage Year"
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Periods for Selected Year */}
          {currentYear && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ChevronRight className="w-6 h-6" />
                  Periods for {currentYear.yearName}
                </h2>
                <p className="text-purple-100 mt-1">
                  Manage monthly accounting periods and their status
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {yearPeriods.map((period) => (
                    <div
                      key={period.id}
                      className={`border-2 rounded-xl p-3 transition-all ${period.isCurrent
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : period.status === 'Open'
                            ? 'border-green-300 hover:shadow-md'
                            : 'border-gray-200 hover:shadow-sm'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${period.isCurrent
                            ? 'bg-purple-600'
                            : period.status === 'Open'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          }`}>
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        {period.isCurrent && (
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            CURRENT
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-1">{period.periodName}</h3>
                      <p className="text-sm text-gray-600 mb-3">{period.periodCode}</p>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{period.startDate} to {period.endDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FileText className="w-3 h-3" />
                          <span>{period.transactionsCount} transactions</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            period.status
                          )}`}
                        >
                          {getStatusIcon(period.status)}
                          {period.status}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetailPeriod(period)}
                            title="View Period Details"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {period.status === 'Open' && (
                            <button
                              onClick={() => handleSetPeriodStatus(period, 'Closed')}
                              disabled={processingPeriod === period.id}
                              title="Close Period"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          )}
                          {period.status === 'Closed' && (
                            <button
                              onClick={() => handleSetPeriodStatus(period, 'Open')}
                              disabled={processingPeriod === period.id}
                              title="Reopen Period"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Period Closing Checklist */}
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Period End Closing Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">All invoices posted</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">Bank reconciliation completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">Depreciation calculated</span>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Valuation - Clickable */}
                  <button
                    onClick={() => setShowInventoryModal(true)}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:border-orange-400 hover:bg-orange-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {checklistStatus.inventoryValuation === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">Inventory valuation</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>

                  {/* Accruals and Provisions - Clickable */}
                  <button
                    onClick={() => setShowAccrualsModal(true)}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:border-red-400 hover:bg-red-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {checklistStatus.accrualsProvisions === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">Accruals and provisions</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>

                  {/* Management Review - Clickable */}
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {checklistStatus.managementReview === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-900">Management review</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Valuation Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Inventory Valuation</h2>
                    <p className="text-orange-100 text-sm">Period: October 2025</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInventoryModal(false)}
                  className="text-white hover:bg-orange-600 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {/* Summary */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-orange-600" />
                    Valuation Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-xl font-bold text-gray-900">1,247</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-xl font-bold text-orange-600">₹45,67,890</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Method</p>
                      <p className="text-sm font-semibold text-gray-900">Weighted Average</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Run</p>
                      <p className="text-sm font-semibold text-gray-900">2025-09-30</p>
                    </div>
                  </div>
                </div>

                {/* Valuation Methods */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Valuation Method</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="method" defaultChecked className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Weighted Average Cost</p>
                        <p className="text-xs text-gray-500">Calculate average cost based on purchase history</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="method" className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">FIFO (First In First Out)</p>
                        <p className="text-xs text-gray-500">Value inventory based on oldest stock first</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="method" className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Standard Cost</p>
                        <p className="text-xs text-gray-500">Use predefined standard costs</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowInventoryModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInventoryValuation}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Run Valuation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accruals and Provisions Modal */}
      {showAccrualsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full  max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Accruals and Provisions</h2>
                    <p className="text-red-100 text-sm">Period: October 2025</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAccrualsModal(false)}
                  className="text-white hover:bg-red-600 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {/* Accruals Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Expense Accruals
                  </h3>
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Electricity Charges</span>
                        <span className="text-lg font-bold text-gray-900">₹45,000</span>
                      </div>
                      <p className="text-sm text-gray-600">Estimated utility charges for the month</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Professional Fees</span>
                        <span className="text-lg font-bold text-gray-900">₹1,25,000</span>
                      </div>
                      <p className="text-sm text-gray-600">Consultant and audit fees accrual</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Salary Accrual</span>
                        <span className="text-lg font-bold text-gray-900">₹8,50,000</span>
                      </div>
                      <p className="text-sm text-gray-600">Month-end salary accrual</p>
                    </div>
                  </div>
                </div>

                {/* Provisions Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Provisions
                  </h3>
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Warranty Provision</span>
                        <span className="text-lg font-bold text-gray-900">₹2,50,000</span>
                      </div>
                      <p className="text-sm text-gray-600">Estimated warranty claims for products sold</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Bad Debt Provision</span>
                        <span className="text-lg font-bold text-gray-900">₹75,000</span>
                      </div>
                      <p className="text-sm text-gray-600">Provision for doubtful receivables</p>
                    </div>
                  </div>
                </div>

                {/* Total Summary */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total Accruals & Provisions</span>
                    <span className="text-2xl font-bold text-red-600">₹13,45,000</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowAccrualsModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccrualsProvisions}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Post Accruals & Provisions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Management Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full  max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Management Review</h2>
                    <p className="text-blue-100 text-sm">Period: October 2025</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-white hover:bg-blue-600 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {/* Financial Highlights */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Financial Highlights
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">₹1,25,67,000</p>
                      <p className="text-xs text-green-700 mt-1">↑ 12% vs last month</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                      <p className="text-2xl font-bold text-blue-600">₹87,45,000</p>
                      <p className="text-xs text-blue-700 mt-1">↑ 5% vs last month</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                      <p className="text-2xl font-bold text-purple-600">₹38,22,000</p>
                      <p className="text-xs text-purple-700 mt-1">↑ 25% vs last month</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                      <p className="text-2xl font-bold text-orange-600">30.4%</p>
                      <p className="text-xs text-orange-700 mt-1">↑ 3.2% vs last month</p>
                    </div>
                  </div>
                </div>

                {/* Review Checklist */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Review Checklist</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-900">Verified revenue recognition and matching principles</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-900">Reviewed major expense categories and anomalies</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-900">Verified balance sheet reconciliations</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input type="checkbox" className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-900">Reviewed cash flow and liquidity position</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input type="checkbox" className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-900">Analyzed variance from budget</span>
                    </label>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Management Comments</h3>
                  <textarea
                    rows={4}
                    placeholder="Enter review comments and observations..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManagementReview}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve & Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Financial Year Modal */}
      {showNewYearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-7 h-7" />
                <h2 className="text-xl font-bold">New Financial Year</h2>
              </div>
              <button
                onClick={() => setShowNewYearModal(false)}
                className="text-white hover:bg-purple-700 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Code *</label>
                <input
                  type="text"
                  value={newYear.yearCode}
                  onChange={(e) => setNewYear({ ...newYear, yearCode: e.target.value })}
                  placeholder="FY2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Name</label>
                <input
                  type="text"
                  value={newYear.yearName}
                  onChange={(e) => setNewYear({ ...newYear, yearName: e.target.value })}
                  placeholder="Financial Year 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={newYear.startDate}
                    onChange={(e) => setNewYear({ ...newYear, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={newYear.endDate}
                    onChange={(e) => setNewYear({ ...newYear, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t">
              <button
                onClick={() => setShowNewYearModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateYear}
                disabled={creatingYear}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {creatingYear ? 'Creating...' : 'Create Year'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Financial Year Details Modal */}
      {detailYear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-7 h-7" />
                <h2 className="text-xl font-bold">{detailYear.yearName}</h2>
              </div>
              <button
                onClick={() => setDetailYear(null)}
                className="text-white hover:bg-purple-700 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">Year Code</p><p className="font-semibold text-gray-900">{detailYear.yearCode}</p></div>
                <div><p className="text-gray-500">Status</p><p className="font-semibold text-gray-900">{detailYear.status}</p></div>
                <div><p className="text-gray-500">Start Date</p><p className="font-semibold text-gray-900">{detailYear.startDate}</p></div>
                <div><p className="text-gray-500">End Date</p><p className="font-semibold text-gray-900">{detailYear.endDate}</p></div>
                <div><p className="text-gray-500">Total Periods</p><p className="font-semibold text-gray-900">{detailYear.periodsCount}</p></div>
                <div><p className="text-gray-500">Open Periods</p><p className="font-semibold text-green-600">{detailYear.openPeriodsCount}</p></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Periods</p>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                  {periods.filter((p) => p.yearCode === detailYear.yearCode).map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="text-gray-900">{p.periodName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(p.status)}`}>{p.status}</span>
                    </div>
                  ))}
                  {periods.filter((p) => p.yearCode === detailYear.yearCode).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No periods defined.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-3 py-2 flex justify-end border-t">
              <button
                onClick={() => setDetailYear(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Financial Period Details Modal */}
      {detailPeriod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-7 h-7" />
                <h2 className="text-xl font-bold">{detailPeriod.periodName}</h2>
              </div>
              <button
                onClick={() => setDetailPeriod(null)}
                className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-500">Period Code</p><p className="font-semibold text-gray-900">{detailPeriod.periodCode}</p></div>
              <div><p className="text-gray-500">Type</p><p className="font-semibold text-gray-900">{detailPeriod.periodType}</p></div>
              <div><p className="text-gray-500">Financial Year</p><p className="font-semibold text-gray-900">{detailPeriod.yearCode}</p></div>
              <div><p className="text-gray-500">Status</p><p className="font-semibold text-gray-900">{detailPeriod.status}</p></div>
              <div><p className="text-gray-500">Start Date</p><p className="font-semibold text-gray-900">{detailPeriod.startDate}</p></div>
              <div><p className="text-gray-500">End Date</p><p className="font-semibold text-gray-900">{detailPeriod.endDate}</p></div>
              <div><p className="text-gray-500">Transactions</p><p className="font-semibold text-gray-900">{detailPeriod.transactionsCount}</p></div>
              <div><p className="text-gray-500">Current</p><p className="font-semibold text-gray-900">{detailPeriod.isCurrent ? 'Yes' : 'No'}</p></div>
            </div>
            <div className="bg-gray-50 px-3 py-2 flex justify-end border-t">
              <button
                onClick={() => setDetailPeriod(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
