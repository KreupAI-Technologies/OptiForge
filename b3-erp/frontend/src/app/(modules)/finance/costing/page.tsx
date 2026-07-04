'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Edit,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface JobCosting {
  id: string;
  costSheetNumber: string;
  jobNumber: string;
  jobName: string;
  projectType: string;
  customer: string;
  costingDate: string;
  status: 'Draft' | 'Approved' | 'Revised' | 'Closed';
  totalEstimatedCost: number;
  totalActualCost: number;
  variance: number;
  variancePercent: number;
  profitMargin: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  costEngineer: string;
}

export default function JobCostingListPage() {
  const [costings, setCostings] = useState<JobCosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await FinanceService.getJobCostSheets()) as any[];
        const mapped: JobCosting[] = raw.map((c) => ({
          id: c.id,
          costSheetNumber: c.costSheetNumber,
          jobNumber: c.jobNumber,
          jobName: c.jobName,
          projectType: c.projectType ?? '',
          customer: c.customer ?? '',
          costingDate: c.costingDate,
          status: c.status,
          totalEstimatedCost: Number(c.totalEstimatedCost ?? 0),
          totalActualCost: Number(c.totalActualCost ?? 0),
          variance: Number(c.variance ?? 0),
          variancePercent: Number(c.variancePercent ?? 0),
          profitMargin: Number(c.profitMargin ?? 0),
          materialCost: Number(c.materialCost ?? 0),
          laborCost: Number(c.laborCost ?? 0),
          overheadCost: Number(c.overheadCost ?? 0),
          costEngineer: c.costEngineer ?? '',
        }));
        if (!cancelled) setCostings(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load cost sheets');
          setCostings([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate statistics
  const stats = {
    total: costings.length,
    totalEstimated: costings.reduce((sum, c) => sum + c.totalEstimatedCost, 0),
    totalActual: costings.reduce((sum, c) => sum + c.totalActualCost, 0),
    totalVariance: costings.reduce((sum, c) => sum + c.variance, 0),
    underBudget: costings.filter(c => c.variance > 0 && c.status !== 'Draft').length,
    overBudget: costings.filter(c => c.variance < 0).length,
    avgProfitMargin: costings.length
      ? costings.reduce((sum, c) => sum + c.profitMargin, 0) / costings.length
      : 0,
  };

  // Filter costings
  const filteredCostings = costings.filter(costing => {
    const matchesSearch =
      costing.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      costing.costSheetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      costing.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || costing.status === statusFilter;
    const matchesType = typeFilter === 'All' || costing.projectType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCostings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCostings = filteredCostings.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Revised': return 'bg-yellow-100 text-yellow-700';
      case 'Closed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Costing</h1>
          <p className="text-gray-600 mt-1">Track estimated vs actual costs for all manufacturing jobs</p>
        </div>
        <Link
          href="/finance/costing"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Cost Sheet
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading cost sheets…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && costings.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No cost sheets found.
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Estimated</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalEstimated)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Actual</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalActual)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Variance</p>
              <p className={`text-2xl font-bold mt-1 ${stats.totalVariance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatCurrency(Math.abs(stats.totalVariance))}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              stats.totalVariance >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {stats.totalVariance >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${stats.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.underBudget} under · {stats.overBudget} over budget
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Profit Margin</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {stats.avgProfitMargin.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cost sheets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Revised">Revised</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Types</option>
            <option value="Commercial Kitchen">Commercial Kitchen</option>
            <option value="Cold Room">Cold Room</option>
            <option value="Switchgear">Switchgear</option>
            <option value="Modular Kitchen">Modular Kitchen</option>
          </select>
        </div>
      </div>

      {/* Costings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated Cost
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Cost
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit Margin
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCostings.map((costing) => (
                <tr key={costing.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-medium text-gray-900">{costing.jobName}</div>
                      <div className="text-sm text-gray-500">{costing.costSheetNumber}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {costing.projectType} · {formatDate(costing.costingDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{costing.customer}</div>
                    <div className="text-xs text-gray-500">By: {costing.costEngineer}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(costing.totalEstimatedCost)}</div>
                    <div className="text-xs text-gray-500">
                      M: {formatCurrency(costing.materialCost)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(costing.totalActualCost)}</div>
                    {costing.status !== 'Draft' && (
                      <div className="text-xs text-gray-500">
                        {Math.round((costing.totalActualCost / costing.totalEstimatedCost) * 100)}% spent
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className={`text-sm font-medium ${costing.variance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {costing.variance >= 0 ? '+' : ''}{formatCurrency(costing.variance)}
                    </div>
                    <div className={`text-xs ${costing.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {costing.variance >= 0 ? '+' : ''}{costing.variancePercent.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-purple-900">{costing.profitMargin}%</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(costing.status)}`}>
                      {costing.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/finance/costing/view/${costing.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                       
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/finance/costing/edit/${costing.id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                       
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCostings.length)} of{' '}
            {filteredCostings.length} cost sheets
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
