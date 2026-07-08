'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Copy,
  Lock,
  Unlock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface Budget {
  id: string;
  budgetCode: string;
  budgetName: string;
  fiscalYear: string;
  department: string;
  costCenter: string;
  budgetType: 'Operating' | 'Capital' | 'Project' | 'Department' | 'Revenue';
  totalBudget: number;
  allocated: number;
  spent: number;
  remaining: number;
  variance: number;
  variancePercent: number;
  status: 'Draft' | 'Approved' | 'Active' | 'Locked' | 'Closed';
  startDate: string;
  endDate: string;
  approvedBy?: string;
  approvedDate?: string;
  revisions: number;
}

export default function BudgetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create / edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState({
    budgetName: '',
    budgetCode: '',
    fiscalYear: '',
    department: '',
    costCenter: '',
    budgetType: 'Operating' as Budget['budgetType'],
    totalBudget: '',
    startDate: '',
    endDate: '',
  });

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await FinanceService.getBudgets()) as any[];
      const typeMap: Record<string, Budget['budgetType']> = {
        'Operating Budget': 'Operating',
        'Capital Budget': 'Capital',
        'Cash Budget': 'Operating',
        'Master Budget': 'Operating',
        Operating: 'Operating',
        Capital: 'Capital',
        Project: 'Project',
        Department: 'Department',
        Revenue: 'Revenue',
      };
      const statusMap: Record<string, Budget['status']> = {
        Draft: 'Draft',
        Submitted: 'Draft',
        Approved: 'Approved',
        Active: 'Active',
        Locked: 'Locked',
        Closed: 'Closed',
        Revised: 'Active',
      };
      const mapped: Budget[] = raw.map((b) => ({
        id: b.id,
        budgetCode: b.budgetCode,
        budgetName: b.budgetName,
        fiscalYear: b.fiscalYear ?? '',
        department: b.department ?? '',
        costCenter: b.costCenter ?? '',
        budgetType: typeMap[b.budgetType] ?? 'Operating',
        totalBudget: Number(b.totalBudget ?? 0),
        allocated: Number(b.allocated ?? b.totalBudget ?? 0),
        spent: Number(b.spent ?? 0),
        remaining: Number(b.remaining ?? 0),
        variance: Number(b.variance ?? 0),
        variancePercent: Number(b.variancePercent ?? 0),
        status: statusMap[b.status] ?? 'Draft',
        startDate: b.startDate ?? '',
        endDate: b.endDate ?? '',
        approvedBy: b.approvedBy ?? undefined,
        approvedDate: b.approvedDate ?? undefined,
        revisions: Number(b.revisions ?? 0),
      }));
      setBudgets(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load budgets');
      setBudgets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Handler Functions
  const resetForm = () => {
    setForm({
      budgetName: '',
      budgetCode: '',
      fiscalYear: '',
      department: '',
      costCenter: '',
      budgetType: 'Operating',
      totalBudget: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleCreateBudget = () => {
    setEditingId(null);
    resetForm();
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmitBudget = async () => {
    if (!form.budgetName.trim() || !form.totalBudget) {
      setFormError('Budget name and total budget are required.');
      return;
    }
    const payload: any = {
      budgetName: form.budgetName.trim(),
      budgetCode: form.budgetCode.trim() || undefined,
      fiscalYear: form.fiscalYear.trim() || undefined,
      department: form.department.trim() || undefined,
      costCenter: form.costCenter.trim() || undefined,
      budgetType: form.budgetType,
      totalBudget: Number(form.totalBudget),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await FinanceService.updateBudget(editingId, payload);
      } else {
        await FinanceService.createBudget(payload);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (budget: Budget) => {
    if (!window.confirm(`Delete budget "${budget.budgetName}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await FinanceService.deleteBudget(budget.id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete budget');
    }
  };

  const handleExportBudgets = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Prepare CSV data with all budget fields
      const csvHeaders = [
        'Budget Code',
        'Budget Name',
        'Fiscal Year',
        'Department',
        'Cost Center',
        'Budget Type',
        'Total Budget',
        'Allocated',
        'Spent',
        'Remaining',
        'Variance',
        'Variance %',
        'Status',
        'Start Date',
        'End Date',
        'Approved By',
        'Approved Date',
        'Revisions',
        'Utilization %'
      ].join(',');

      const csvRows = filteredBudgets.map(budget => [
        budget.budgetCode,
        `"${budget.budgetName}"`,
        budget.fiscalYear,
        `"${budget.department}"`,
        budget.costCenter,
        budget.budgetType,
        budget.totalBudget,
        budget.allocated,
        budget.spent,
        budget.remaining,
        budget.variance,
        budget.variancePercent,
        budget.status,
        budget.startDate,
        budget.endDate,
        budget.approvedBy || 'N/A',
        budget.approvedDate || 'N/A',
        budget.revisions,
        ((budget.spent / budget.totalBudget) * 100).toFixed(2)
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `budgets_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      alert(`Successfully exported ${filteredBudgets.length} budget(s) to CSV file with all fields including:\n- Budget details\n- Financial data\n- Variance analysis\n- Status information\n- Approval details`);
    }, 500);
  };

  const handleViewBudget = (budget: Budget) => {
    alert(
      `View Budget Details\n\n` +
      `Budget: ${budget.budgetName}\n` +
      `Code: ${budget.budgetCode}\n` +
      `Type: ${budget.budgetType}\n` +
      `Department: ${budget.department}\n` +
      `Status: ${budget.status}\n\n` +
      `Financial Summary:\n` +
      `- Total Budget: ${formatCurrency(budget.totalBudget)}\n` +
      `- Allocated: ${formatCurrency(budget.allocated)}\n` +
      `- Spent: ${formatCurrency(budget.spent)}\n` +
      `- Remaining: ${formatCurrency(budget.remaining)}\n` +
      `- Variance: ${formatCurrency(budget.variance)} (${budget.variancePercent}%)\n\n` +
      `Period: ${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}\n` +
      `Approved By: ${budget.approvedBy || 'Pending'}\n` +
      `Revisions: ${budget.revisions}\n\n` +
      `In production, this would open a detailed view showing:\n` +
      `- Budget line items breakdown\n` +
      `- Spending history and timeline\n` +
      `- Approval workflow\n` +
      `- Variance analysis charts\n` +
      `- Transaction details\n` +
      `- Revision history`
    );
  };

  const handleEditBudget = (budget: Budget) => {
    if (budget.status === 'Locked' || budget.status === 'Closed') {
      setActionError(
        `Budget "${budget.budgetName}" is ${budget.status.toLowerCase()} and cannot be edited. Unlock it first.`,
      );
      return;
    }
    setEditingId(budget.id);
    setForm({
      budgetName: budget.budgetName,
      budgetCode: budget.budgetCode,
      fiscalYear: budget.fiscalYear,
      department: budget.department,
      costCenter: budget.costCenter,
      budgetType: budget.budgetType,
      totalBudget: String(budget.totalBudget),
      startDate: budget.startDate ? String(budget.startDate).slice(0, 10) : '',
      endDate: budget.endDate ? String(budget.endDate).slice(0, 10) : '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleCopyBudget = async (budget: Budget) => {
    if (!window.confirm(`Create a copy of "${budget.budgetName}" as a new Draft budget?`)) return;
    setActionError(null);
    try {
      await FinanceService.createBudget({
        budgetName: `${budget.budgetName} (Copy)`,
        fiscalYear: budget.fiscalYear || undefined,
        department: budget.department || undefined,
        costCenter: budget.costCenter || undefined,
        budgetType: budget.budgetType,
        totalBudget: budget.totalBudget,
        startDate: budget.startDate || undefined,
        endDate: budget.endDate || undefined,
        status: 'Draft',
      });
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to copy budget');
    }
  };

  const handleLockBudget = async (budget: Budget) => {
    if (!window.confirm(`Lock budget "${budget.budgetName}"? It will become read-only.`)) return;
    setActionError(null);
    try {
      await FinanceService.updateBudget(budget.id, { status: 'Locked' });
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to lock budget');
    }
  };

  const handleUnlockBudget = async (budget: Budget) => {
    if (!window.confirm(`Unlock budget "${budget.budgetName}"?`)) return;
    setActionError(null);
    try {
      await FinanceService.updateBudget(budget.id, { status: 'Active' });
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to unlock budget');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch =
      budget.budgetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.budgetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || budget.budgetType === typeFilter;
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || budget.department === departmentFilter;

    return matchesSearch && matchesType && matchesStatus && matchesDepartment;
  });

  // Calculate statistics
  const totalBudgeted = budgets
    .filter(b => b.status === 'Active')
    .reduce((sum, b) => sum + b.totalBudget, 0);

  const totalSpent = budgets
    .filter(b => b.status === 'Active')
    .reduce((sum, b) => sum + b.spent, 0);

  const totalRemaining = budgets
    .filter(b => b.status === 'Active')
    .reduce((sum, b) => sum + b.remaining, 0);

  const overBudgetCount = budgets.filter(b => b.remaining < 0).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      Approved: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      Active: 'bg-green-500/20 text-green-400 border-green-500/50',
      Locked: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      Closed: 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    const icons = {
      Draft: Edit,
      Approved: CheckCircle,
      Active: Target,
      Locked: Lock,
      Closed: XCircle
    };
    const Icon = icons[status as keyof typeof icons];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getBudgetTypeBadge = (type: string) => {
    const colors = {
      Operating: 'bg-blue-500/20 text-blue-400',
      Capital: 'bg-purple-500/20 text-purple-400',
      Project: 'bg-green-500/20 text-green-400',
      Department: 'bg-orange-500/20 text-orange-400',
      Revenue: 'bg-cyan-500/20 text-cyan-400'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
        {type}
      </span>
    );
  };

  const getUtilizationPercentage = (spent: number, total: number) => {
    return ((spent / total) * 100).toFixed(1);
  };

  const getUtilizationColor = (spent: number, total: number) => {
    const percent = (spent / total) * 100;
    if (percent > 100) return 'bg-red-500';
    if (percent > 90) return 'bg-orange-500';
    if (percent > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-3">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Budget Management</h1>
            <p className="text-gray-400">Create, track, and manage organizational budgets</p>
          </div>
          <button
            onClick={handleCreateBudget}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Budget
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            Loading budgets…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {actionError && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-red-300 hover:text-red-100">✕</button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalBudgeted)}</div>
            <div className="text-blue-100 text-sm">Total Budgeted</div>
            <div className="mt-2 text-xs text-blue-100">
              {budgets.filter(b => b.status === 'Active').length} active budgets
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 opacity-80" />
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalSpent)}</div>
            <div className="text-orange-100 text-sm">Total Spent</div>
            <div className="mt-2 text-xs text-orange-100">
              {((totalSpent / totalBudgeted) * 100).toFixed(1)}% utilized
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalRemaining)}</div>
            <div className="text-green-100 text-sm">Total Remaining</div>
            <div className="mt-2 text-xs text-green-100">Available for allocation</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <XCircle className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{overBudgetCount}</div>
            <div className="text-red-100 text-sm">Over Budget</div>
            <div className="mt-2 text-xs text-red-100">Requires attention</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by budget name, code, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Types</option>
                <option value="Operating">Operating</option>
                <option value="Capital">Capital</option>
                <option value="Project">Project</option>
                <option value="Department">Department</option>
                <option value="Revenue">Revenue</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Active">Active</option>
                <option value="Locked">Locked</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Departments</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="IT">IT</option>
                <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Engineering">Engineering</option>
                <option value="Facilities">Facilities</option>
              </select>
            </div>

            <button
              onClick={handleExportBudgets}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Budgets Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Budget Details</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Department</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Total Budget</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Spent</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Remaining</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Utilization</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.map((budget) => {
                  const utilizationPercent = parseFloat(getUtilizationPercentage(budget.spent, budget.totalBudget));
                  const isOverBudget = budget.remaining < 0;

                  return (
                    <tr key={budget.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="px-3 py-2">
                        <div>
                          <div className="font-medium text-white">{budget.budgetName}</div>
                          <div className="text-sm text-gray-400 font-mono">{budget.budgetCode}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {getBudgetTypeBadge(budget.budgetType)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-white text-sm">{budget.department}</div>
                        <div className="text-xs text-gray-400">{budget.costCenter}</div>
                      </td>
                      <td className="px-3 py-2 text-right text-white font-medium">
                        {formatCurrency(budget.totalBudget)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-orange-400'}`}>
                          {formatCurrency(budget.spent)}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                          {isOverBudget && '('}{formatCurrency(budget.remaining)}{isOverBudget && ')'}
                        </div>
                        {budget.variance !== 0 && (
                          <div className={`text-xs mt-1 ${budget.variance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            Variance: {budget.variance > 0 && '+'}{formatCurrency(budget.variance)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-medium mb-1 ${utilizationPercent > 100 ? 'text-red-400' :
                              utilizationPercent > 90 ? 'text-orange-400' :
                                utilizationPercent > 75 ? 'text-yellow-400' :
                                  'text-green-400'
                            }`}>
                            {utilizationPercent.toFixed(1)}%
                          </span>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getUtilizationColor(budget.spent, budget.totalBudget)}`}
                              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getStatusBadge(budget.status)}
                        {budget.revisions > 0 && (
                          <div className="text-xs text-gray-400 mt-1">Rev {budget.revisions}</div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewBudget(budget)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Budget Details"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit Budget"
                          >
                            <Edit className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={() => handleCopyBudget(budget)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copy Budget"
                          >
                            <Copy className="w-4 h-4 text-purple-400" />
                          </button>
                          {budget.status === 'Active' ? (
                            <button
                              onClick={() => handleLockBudget(budget)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Lock Budget"
                            >
                              <Unlock className="w-4 h-4 text-orange-400" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnlockBudget(budget)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Unlock Budget"
                            >
                              <Lock className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBudget(budget)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete Budget"
                          >
                            <XCircle className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBudgets.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-600 mb-2" />
              <p className="text-gray-400 text-lg">No budgets found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredBudgets.length > 0 && (
          <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
            <div className="text-gray-400 text-sm">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredBudgets.length)} - {Math.min(currentPage * itemsPerPage, filteredBudgets.length)} of {filteredBudgets.length} budgets
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.ceil(filteredBudgets.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={handleNextPage}
                disabled={currentPage === Math.ceil(filteredBudgets.length / itemsPerPage)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-white">
              {editingId ? 'Edit Budget' : 'Create Budget'}
            </h3>
            {formError && (
              <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-400">Budget Name *</label>
                <input
                  type="text"
                  value={form.budgetName}
                  onChange={(e) => setForm({ ...form, budgetName: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Budget Code</label>
                <input
                  type="text"
                  value={form.budgetCode}
                  onChange={(e) => setForm({ ...form, budgetCode: e.target.value })}
                  placeholder="Auto if blank"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Fiscal Year</label>
                <input
                  type="text"
                  value={form.fiscalYear}
                  onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                  placeholder="2025-26"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Cost Center</label>
                <input
                  type="text"
                  value={form.costCenter}
                  onChange={(e) => setForm({ ...form, costCenter: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Budget Type</label>
                <select
                  value={form.budgetType}
                  onChange={(e) => setForm({ ...form, budgetType: e.target.value as Budget['budgetType'] })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Operating">Operating</option>
                  <option value="Capital">Capital</option>
                  <option value="Project">Project</option>
                  <option value="Department">Department</option>
                  <option value="Revenue">Revenue</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Total Budget *</label>
                <input
                  type="number"
                  value={form.totalBudget}
                  onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBudget}
                disabled={submitting}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Budget' : 'Create Budget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
