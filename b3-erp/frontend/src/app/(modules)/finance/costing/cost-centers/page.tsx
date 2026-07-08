'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FinanceService } from '@/services/finance.service';
import {
  Building,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Trash2,
  X,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  department: string;
  manager: string;
  type: 'Production' | 'Service' | 'Administrative' | 'Sales' | 'R&D';
  status: 'Active' | 'Inactive';
  budgetAllocated: number;
  actualCost: number;
  variance: number;
  variancePercent: number;
  employeeCount: number;
  openingDate: string;
  description: string;
}

export default function CostCentersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create / edit modal state
  const emptyForm = {
    code: '',
    name: '',
    department: '',
    manager: '',
    type: 'Service' as CostCenter['type'],
    status: 'Active' as CostCenter['status'],
    budgetAllocated: '',
    actualCost: '',
    employeeCount: '',
    openingDate: '',
    description: '',
  };
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const mapCostCenter = (r: any): CostCenter => {
    const budgetAllocated = Number(r.budgetAllocated ?? r.budget ?? 0);
    const actualCost = Number(r.actualCost ?? 0);
    const variance = Number(r.variance ?? (budgetAllocated - actualCost));
    const variancePercent = budgetAllocated
      ? Number(((variance / budgetAllocated) * 100).toFixed(1))
      : 0;
    const typeVal = r.isProfitCenter ? 'Production' : (r.type ?? 'Service');
    return {
      id: r.id ?? r.costCenterCode ?? '',
      code: r.costCenterCode ?? r.code ?? '',
      name: r.costCenterName ?? r.name ?? '',
      department: r.department ?? '',
      manager: r.managerName ?? r.manager ?? '',
      type: (['Production', 'Service', 'Administrative', 'Sales', 'R&D'].includes(typeVal)
        ? typeVal
        : 'Service') as CostCenter['type'],
      status: (r.isActive ?? true) ? 'Active' : 'Inactive',
      budgetAllocated,
      actualCost,
      variance,
      variancePercent,
      employeeCount: Number(r.employeeCount ?? 0),
      openingDate: r.openingDate ?? (r.createdAt ? String(r.createdAt).slice(0, 10) : ''),
      description: r.description ?? '',
    };
  };

  const loadCostCenters = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await FinanceService.getCostCenters()) as any[];
      const mapped = (Array.isArray(raw) ? raw : []).map(mapCostCenter);
      setCostCenters(mapped);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load cost centers');
      setCostCenters([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCostCenters();
  }, [loadCostCenters]);


  const filteredCostCenters = costCenters.filter(cc => {
    const matchesSearch =
      cc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cc.manager.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || cc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || cc.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || cc.department === departmentFilter;

    return matchesSearch && matchesType && matchesStatus && matchesDepartment;
  });

  // Calculate statistics
  const totalBudget = costCenters.reduce((sum, cc) => sum + cc.budgetAllocated, 0);
  const totalActual = costCenters.reduce((sum, cc) => sum + cc.actualCost, 0);
  const totalVariance = costCenters.reduce((sum, cc) => sum + cc.variance, 0);
  const totalEmployees = costCenters.reduce((sum, cc) => sum + cc.employeeCount, 0);
  const overBudgetCount = costCenters.filter(cc => cc.variance < 0).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      Production: 'bg-blue-500/20 text-blue-400',
      Service: 'bg-green-500/20 text-green-400',
      Administrative: 'bg-purple-500/20 text-purple-400',
      Sales: 'bg-orange-500/20 text-orange-400',
      'R&D': 'bg-cyan-500/20 text-cyan-400'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
        {type}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-500/20 text-green-400 border-green-500/50',
      Inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    };
    const icons = {
      Active: CheckCircle,
      Inactive: AlertCircle
    };
    const Icon = icons[status as keyof typeof icons];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getVarianceIndicator = (variance: number, percent: number) => {
    const isFavorable = variance >= 0;
    return (
      <div className={`flex flex-col ${isFavorable ? 'text-green-400' : 'text-red-400'}`}>
        <div className="font-medium">
          {isFavorable ? '+' : ''}{formatCurrency(variance)}
        </div>
        <div className="text-xs">
          {isFavorable ? '+' : ''}{percent.toFixed(1)}%
        </div>
      </div>
    );
  };

  // Handler Functions
  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setShowModal(true);
  };

  const handleAddCostCenter = () => {
    openCreateModal();
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleFormChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitModal = async () => {
    if (!form.name.trim()) {
      setFormError('Cost center name is required');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const payload: any = {
        code: form.code.trim(),
        costCenterCode: form.code.trim(),
        name: form.name.trim(),
        costCenterName: form.name.trim(),
        department: form.department.trim(),
        manager: form.manager.trim(),
        managerName: form.manager.trim(),
        type: form.type,
        status: form.status,
        isActive: form.status === 'Active',
        budgetAllocated: form.budgetAllocated === '' ? 0 : Number(form.budgetAllocated),
        budget: form.budgetAllocated === '' ? 0 : Number(form.budgetAllocated),
        actualCost: form.actualCost === '' ? 0 : Number(form.actualCost),
        employeeCount: form.employeeCount === '' ? 0 : Number(form.employeeCount),
        openingDate: form.openingDate || undefined,
        description: form.description.trim(),
      };
      if (editingId) {
        await FinanceService.updateCostCenter(editingId, payload);
      } else {
        await FinanceService.createCostCenter(payload);
      }
      setShowModal(false);
      setEditingId(null);
      await loadCostCenters();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save cost center');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCostCenter = async (center: CostCenter) => {
    if (!window.confirm(`Delete cost center "${center.name}" (${center.code})? This cannot be undone.`)) {
      return;
    }
    try {
      await FinanceService.deleteCostCenter(center.id);
      await loadCostCenters();
    } catch (e) {
      alert('Failed to delete cost center: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const handleExportCostCenters = () => {
    setIsExporting(true);

    try {
      // Prepare CSV data with ALL fields
      const csvHeaders = [
        'Cost Center ID',
        'Code',
        'Name',
        'Type',
        'Department',
        'Manager',
        'Status',
        'Budget Allocated',
        'Actual Cost',
        'Variance Amount',
        'Variance %',
        'Utilization %',
        'Employee Count',
        'Opening Date',
        'Description'
      ];

      const csvRows = filteredCostCenters.map(cc => {
        const utilizationPercent = (cc.actualCost / cc.budgetAllocated) * 100;
        return [
          cc.id,
          cc.code,
          cc.name,
          cc.type,
          cc.department,
          cc.manager,
          cc.status,
          cc.budgetAllocated.toString(),
          cc.actualCost.toString(),
          cc.variance.toString(),
          cc.variancePercent.toFixed(2),
          utilizationPercent.toFixed(2),
          cc.employeeCount.toString(),
          cc.openingDate,
          `"${cc.description}"`
        ];
      });

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `cost_centers_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        alert(
          '✅ Export Successful!\n\n' +
          `Exported ${filteredCostCenters.length} cost center(s) to CSV.\n\n` +
          'The file includes all fields:\n' +
          '• Cost Center ID & Code\n' +
          '• Name, Type, Department\n' +
          '• Manager & Status\n' +
          '• Budget, Actual Cost, Variance\n' +
          '• Utilization & Employee Count\n' +
          '• Opening Date & Description\n\n' +
          'File name: cost_centers_export_' + new Date().toISOString().split('T')[0] + '.csv'
        );
        setIsExporting(false);
      }, 500);
    } catch (error) {
      alert('❌ Export failed: ' + (error as Error).message);
      setIsExporting(false);
    }
  };

  const handleViewCostCenter = (center: CostCenter) => {
    const utilizationPercent = (center.actualCost / center.budgetAllocated) * 100;
    const allocationPercent = (center.budgetAllocated / totalBudget) * 100;

    alert(
      `📊 Cost Center Details: ${center.name}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `BASIC INFORMATION\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Code: ${center.code}\n` +
      `Name: ${center.name}\n` +
      `Type: ${center.type}\n` +
      `Department: ${center.department}\n` +
      `Manager: ${center.manager}\n` +
      `Status: ${center.status}\n` +
      `Opening Date: ${center.openingDate}\n` +
      `Employees: ${center.employeeCount}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `FINANCIAL DETAILS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Budget Allocated: ${formatCurrency(center.budgetAllocated)}\n` +
      `Actual Cost: ${formatCurrency(center.actualCost)}\n` +
      `Variance: ${center.variance >= 0 ? '+' : ''}${formatCurrency(center.variance)} (${center.variancePercent >= 0 ? '+' : ''}${center.variancePercent.toFixed(1)}%)\n` +
      `Utilization: ${utilizationPercent.toFixed(1)}%\n` +
      `Budget Allocation: ${allocationPercent.toFixed(1)}% of total budget\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `DESCRIPTION\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${center.description}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `COST ALLOCATIONS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `In production, this would show:\n` +
      `• Monthly cost breakdown\n` +
      `• Cost categories (Labor, Materials, Overhead)\n` +
      `• Historical spending trends\n` +
      `• Budget vs Actual comparison charts\n` +
      `• Employee allocation details\n` +
      `• Associated projects/activities\n\n` +
      `In production, this would:\n` +
      `1. Fetch from: GET /api/finance/cost-centers/${center.id}\n` +
      `2. Display in a detailed modal/drawer\n` +
      `3. Show interactive charts and graphs\n` +
      `4. Include download/print options`
    );
  };

  const handleEditCostCenter = (center: CostCenter) => {
    setEditingId(center.id);
    setForm({
      code: center.code,
      name: center.name,
      department: center.department,
      manager: center.manager,
      type: center.type,
      status: center.status,
      budgetAllocated: String(center.budgetAllocated ?? ''),
      actualCost: String(center.actualCost ?? ''),
      employeeCount: String(center.employeeCount ?? ''),
      openingDate: center.openingDate ?? '',
      description: center.description ?? '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleViewAnalytics = (center: CostCenter) => {
    const utilizationPercent = (center.actualCost / center.budgetAllocated) * 100;
    const monthlyAverage = center.actualCost / 12;
    const costPerEmployee = center.actualCost / center.employeeCount;
    const remainingBudget = center.budgetAllocated - center.actualCost;
    const runwayMonths = remainingBudget > 0 ? (remainingBudget / monthlyAverage).toFixed(1) : '0';

    alert(
      `📈 Analytics Dashboard: ${center.name}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `KEY PERFORMANCE INDICATORS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Budget Utilization: ${utilizationPercent.toFixed(1)}%\n` +
      `Variance: ${center.variance >= 0 ? '+' : ''}${formatCurrency(center.variance)} (${center.variancePercent >= 0 ? '+' : ''}${center.variancePercent.toFixed(1)}%)\n` +
      `Monthly Avg Spend: ${formatCurrency(monthlyAverage)}\n` +
      `Cost per Employee: ${formatCurrency(costPerEmployee)}\n` +
      `Remaining Budget: ${formatCurrency(remainingBudget)}\n` +
      `Budget Runway: ${runwayMonths} months\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `SPENDING TRENDS (YTD)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Total Spent: ${formatCurrency(center.actualCost)}\n` +
      `vs Budget: ${utilizationPercent.toFixed(1)}%\n` +
      `Trend: ${center.variance >= 0 ? '📉 Under Budget' : '📈 Over Budget'}\n` +
      `Status: ${utilizationPercent > 100 ? '⚠️ OVER BUDGET' : utilizationPercent > 90 ? '⚠️ CRITICAL' : '✅ HEALTHY'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `COST BREAKDOWN (Estimated)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Labor Costs: ${formatCurrency(center.actualCost * 0.60)} (60%)\n` +
      `Operating Expenses: ${formatCurrency(center.actualCost * 0.25)} (25%)\n` +
      `Materials/Resources: ${formatCurrency(center.actualCost * 0.10)} (10%)\n` +
      `Other Expenses: ${formatCurrency(center.actualCost * 0.05)} (5%)\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `EFFICIENCY METRICS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Employees: ${center.employeeCount}\n` +
      `Cost per Employee: ${formatCurrency(costPerEmployee)}\n` +
      `Budget per Employee: ${formatCurrency(center.budgetAllocated / center.employeeCount)}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `COMPARATIVE ANALYSIS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `In production, this would show:\n` +
      `• Month-over-month trends (line charts)\n` +
      `• Year-over-year comparison\n` +
      `• Budget vs Actual comparison (bar charts)\n` +
      `• Cost category breakdown (pie charts)\n` +
      `• Benchmark against similar cost centers\n` +
      `• Forecasting and projections\n` +
      `• Alert thresholds and notifications\n` +
      `• Drill-down into expense categories\n` +
      `• Export analytics reports\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `RECOMMENDATIONS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      (utilizationPercent > 100
        ? `⚠️ IMMEDIATE ACTION REQUIRED\n• Cost center is over budget\n• Review and reduce expenses\n• Consider budget reallocation\n• Implement cost control measures`
        : utilizationPercent > 90
          ? `⚠️ MONITOR CLOSELY\n• Approaching budget limit\n• Review remaining expenses\n• Prepare for potential overage\n• Consider spending freeze`
          : `✅ PERFORMING WELL\n• Budget utilization healthy\n• Continue current operations\n• Monitor for any anomalies\n• Maintain cost efficiency`
      ) +
      `\n\n` +
      `In production, this would:\n` +
      `1. Fetch analytics from: GET /api/finance/cost-centers/${center.id}/analytics\n` +
      `2. Display interactive dashboard with charts\n` +
      `3. Allow date range selection\n` +
      `4. Export analytics reports (PDF/Excel)\n` +
      `5. Set up custom alerts and thresholds\n` +
      `6. Compare with other cost centers\n` +
      `7. Show predictive analytics and forecasts`
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert(
      `📄 Page Navigation\n\n` +
      `Navigating to page ${page}\n\n` +
      `In production, this would:\n` +
      `1. Update currentPage state to: ${page}\n` +
      `2. Calculate offset: ${(page - 1) * itemsPerPage}\n` +
      `3. Fetch data from API with pagination:\n` +
      `   GET /api/finance/cost-centers?page=${page}&limit=${itemsPerPage}\n` +
      `4. Update the displayed cost centers\n` +
      `5. Scroll to top of table\n` +
      `6. Update pagination UI\n\n` +
      `Current settings:\n` +
      `• Items per page: ${itemsPerPage}\n` +
      `• Total items: ${filteredCostCenters.length}\n` +
      `• Total pages: ${Math.ceil(filteredCostCenters.length / itemsPerPage)}`
    );
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredCostCenters.length / itemsPerPage);
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 p-3">
      <div className="w-full space-y-3">
        {isLoading && (
          <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">Loading cost centers…</div>
        )}
        {loadError && !isLoading && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{loadError}</div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cost Centers</h1>
            <p className="text-gray-400">Manage and monitor departmental cost centers</p>
          </div>
          <button
            onClick={handleAddCostCenter}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Cost Center
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
              <Building className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{costCenters.length}</div>
            <div className="text-blue-100 text-sm">Total Cost Centers</div>
            <div className="mt-2 text-xs text-blue-100">{costCenters.filter(cc => cc.status === 'Active').length} active</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalBudget)}</div>
            <div className="text-purple-100 text-sm">Total Budget</div>
            <div className="mt-2 text-xs text-purple-100">Allocated amount</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 opacity-80" />
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalActual)}</div>
            <div className="text-orange-100 text-sm">Total Spent</div>
            <div className="mt-2 text-xs text-orange-100">
              {((totalActual / totalBudget) * 100).toFixed(1)}% utilized
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
            </div>
            <div className="text-green-100 text-sm">Overall Variance</div>
            <div className="mt-2 text-xs text-green-100">
              {totalVariance >= 0 ? 'Under' : 'Over'} budget
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{totalEmployees}</div>
            <div className="text-cyan-100 text-sm">Total Employees</div>
            <div className="mt-2 text-xs text-cyan-100">Across all centers</div>
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
                  placeholder="Search by name, code, or manager..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="Production">Production</option>
                <option value="Service">Service</option>
                <option value="Administrative">Administrative</option>
                <option value="Sales">Sales</option>
                <option value="R&D">R&D</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Departments</option>
                <option value="Operations">Operations</option>
                <option value="IT">IT</option>
                <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={handleExportCostCenters}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Cost Centers Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Cost Center</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Manager</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Budget</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Actual Cost</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Variance</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Utilization</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Employees</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCostCenters.map((cc) => {
                  const utilizationPercent = (cc.actualCost / cc.budgetAllocated) * 100;

                  return (
                    <tr key={cc.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="px-3 py-2">
                        <div>
                          <div className="font-medium text-white">{cc.name}</div>
                          <div className="text-sm text-gray-400 font-mono">{cc.code}</div>
                          <div className="text-xs text-gray-500 mt-1">{cc.department}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {getTypeBadge(cc.type)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-white text-sm">{cc.manager}</div>
                            <div className="text-xs text-gray-400">Manager</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-white font-medium">
                        {formatCurrency(cc.budgetAllocated)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className={`font-medium ${cc.variance < 0 ? 'text-orange-400' : 'text-green-400'}`}>
                          {formatCurrency(cc.actualCost)}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {getVarianceIndicator(cc.variance, cc.variancePercent)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-medium mb-1 ${utilizationPercent > 100 ? 'text-red-400' :
                              utilizationPercent > 90 ? 'text-orange-400' :
                                'text-green-400'
                            }`}>
                            {utilizationPercent.toFixed(1)}%
                          </span>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${utilizationPercent > 100 ? 'bg-red-500' :
                                  utilizationPercent > 90 ? 'bg-orange-500' :
                                    'bg-green-500'
                                }`}
                              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">{cc.employeeCount}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getStatusBadge(cc.status)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewCostCenter(cc)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleEditCostCenter(cc)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit Cost Center"
                          >
                            <Edit className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={() => handleViewAnalytics(cc)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-4 h-4 text-purple-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteCostCenter(cc)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete Cost Center"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCostCenters.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-600 mb-2" />
              <p className="text-gray-400 text-lg">No cost centers found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredCostCenters.length > 0 && (
          <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
            <div className="text-gray-400 text-sm">
              Showing {filteredCostCenters.length} of {costCenters.length} cost centers
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(1)}
                className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
              >
                1
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= Math.ceil(filteredCostCenters.length / itemsPerPage)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-700 bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-3">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Cost Center' : 'Add Cost Center'}
              </h2>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-1 rounded-lg hover:bg-gray-700 text-gray-400 disabled:opacity-50"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {formError && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => handleFormChange('code', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. CC-001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Cost center name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => handleFormChange('department', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Operations"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Manager</label>
                  <input
                    type="text"
                    value={form.manager}
                    onChange={(e) => handleFormChange('manager', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Manager name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Production">Production</option>
                    <option value="Service">Service</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Sales">Sales</option>
                    <option value="R&D">R&D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Budget Allocated</label>
                  <input
                    type="number"
                    value={form.budgetAllocated}
                    onChange={(e) => handleFormChange('budgetAllocated', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Actual Cost</label>
                  <input
                    type="number"
                    value={form.actualCost}
                    onChange={(e) => handleFormChange('actualCost', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Employee Count</label>
                  <input
                    type="number"
                    value={form.employeeCount}
                    onChange={(e) => handleFormChange('employeeCount', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Opening Date</label>
                  <input
                    type="date"
                    value={form.openingDate}
                    onChange={(e) => handleFormChange('openingDate', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-700 px-5 py-3">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitModal}
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving…' : editingId ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
