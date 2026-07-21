'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  PieChart as PieIcon,
  Plus,
  ArrowRight,
  Edit2,
  Save,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import { TrainingDevelopmentService } from '@/services/training-development.service';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface Allocation {
  id: number | string;
  department: string;
  amount: number;
  allocated: number;
  spend: number;
  color: string;
}

const ALLOCATION_COLORS = ['#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#10b981'];

export default function BudgetAllocationPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [totalBudget, setTotalBudget] = useState(300000);
  const [isEditing, setIsEditing] = useState<number | string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [rowBusy, setRowBusy] = useState<number | string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    budgetName: '',
    fiscalYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    totalBudget: '',
    allocatedBudget: '',
  });

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await HrPagesService.expenseBudgets()) as any[];
      const mapped: Allocation[] = (Array.isArray(raw) ? raw : []).map((r, i) => ({
        id: r.id ?? i,
        department: r.department ?? r.departmentName ?? r.name ?? r.category ?? '',
        amount: Number(r.amount ?? r.total ?? r.budget ?? 0),
        allocated: Number(r.allocated ?? r.percentage ?? 0),
        spend: Number(r.spend ?? r.spent ?? 0),
        color: r.color ?? ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
      }));
      setAllocations(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load allocations');
      setAllocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateBudget = async () => {
    if (!form.budgetName || !form.totalBudget) {
      setSubmitError('Please provide a budget name and total amount.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await TrainingDevelopmentService.createTrainingBudget({
        budgetName: form.budgetName,
        fiscalYear: form.fiscalYear,
        totalBudget: Number(form.totalBudget),
        allocatedBudget: form.allocatedBudget ? Number(form.allocatedBudget) : Number(form.totalBudget),
      });
      setShowAddModal(false);
      setForm({
        budgetName: '',
        fiscalYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        totalBudget: '',
        allocatedBudget: '',
      });
      await load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item: Allocation) => {
    setRowError(null);
    setEditAmount(String(item.amount));
    setIsEditing(item.id);
  };

  const saveRow = async (item: Allocation) => {
    setRowBusy(item.id);
    setRowError(null);
    try {
      await TrainingDevelopmentService.updateTrainingBudget(String(item.id), {
        totalBudget: Number(editAmount),
        allocatedBudget: Number(editAmount),
        usedBudget: item.spend,
        departmentName: item.department,
      });
      setIsEditing(null);
      await load();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Failed to save allocation.');
    } finally {
      setRowBusy(null);
    }
  };

  const deleteRow = async (item: Allocation) => {
    if (!window.confirm(`Delete the "${item.department}" budget allocation?`)) return;
    setRowBusy(item.id);
    setRowError(null);
    try {
      await TrainingDevelopmentService.deleteTrainingBudget(String(item.id));
      await load();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Failed to delete allocation.');
    } finally {
      setRowBusy(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-purple-600" />
            Budget Allocation
          </h1>
          <p className="text-gray-500 mt-1">Plan and distribute annual training funds</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setIsEditing(null); setRowError(null); load(); }}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading allocations…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {rowError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {rowError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Total Budget Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col justify-center">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Total Annual Budget</h2>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-extrabold text-gray-900">{formatCurrency(totalBudget)}</span>
            <button className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 inline-block px-2 py-1 rounded">
            +15% increase from last year
          </p>
          <div className="mt-8">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Allocated</span>
              <span className="font-bold text-gray-900">100%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full w-full"></div>
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-full h-64 sm:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocations}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {allocations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-1/2 space-y-3">
            <h3 className="font-bold text-gray-900 mb-2">Distribution Summary</h3>
            {allocations.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.department}</span>
                </div>
                <span className="font-medium text-gray-900">{item.allocated}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Allocation Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">Departmental Allocations</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm text-purple-600 font-medium hover:text-purple-800 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Budget
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Percentage</th>
                <th className="px-3 py-2">Total Amount</th>
                <th className="px-3 py-2">Spending (YTD)</th>
                <th className="px-3 py-2">Remaining</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allocations.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    {item.department}
                  </td>
                  <td className="px-3 py-2">
                    {item.allocated + '%'}
                  </td>
                  <td className="px-3 py-2 font-semibold">
                    {isEditing === item.id ? (
                      <input
                        type="number"
                        className="w-28 px-2 py-1 border rounded text-sm"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    ) : (
                      formatCurrency(item.amount)
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-500">{formatCurrency(item.spend)}</td>
                  <td className="px-3 py-2 font-medium text-green-600">{formatCurrency(item.amount - item.spend)}</td>
                  <td className="px-3 py-2 text-right flex items-center justify-end gap-2">
                    {isEditing === item.id ? (
                      <button
                        className="text-green-600 hover:text-green-800 p-1 disabled:opacity-50"
                        onClick={() => saveRow(item)}
                        disabled={rowBusy === item.id}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        className="text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => startEdit(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                      onClick={() => deleteRow(item)}
                      disabled={rowBusy === item.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-3 m-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">Create Training Budget</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2">
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name</label>
                <input
                  type="text"
                  value={form.budgetName}
                  onChange={(e) => setForm({ ...form, budgetName: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="e.g. Engineering FY25 Training"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
                <input
                  type="text"
                  value={form.fiscalYear}
                  onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="e.g. 2025-2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget</label>
                  <input
                    type="number"
                    value={form.totalBudget}
                    onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allocated</label>
                  <input
                    type="number"
                    value={form.allocatedBudget}
                    onChange={(e) => setForm({ ...form, allocatedBudget: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Defaults to total"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBudget}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Create Budget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
