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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

// Mock Data
const initialAllocations = [
  { id: 1, department: 'Engineering', amount: 120000, allocated: 40, spend: 45000, color: '#8b5cf6' },
  { id: 2, department: 'Sales', amount: 90000, allocated: 30, spend: 62000, color: '#f59e0b' },
  { id: 3, department: 'Marketing', amount: 45000, allocated: 15, spend: 12000, color: '#ec4899' },
  { id: 4, department: 'HR & Ops', amount: 30000, allocated: 10, spend: 18000, color: '#3b82f6' },
  { id: 5, department: 'Customer Support', amount: 15000, allocated: 5, spend: 5000, color: '#10b981' },
];

export default function BudgetAllocationPage() {
  const [allocations, setAllocations] = useState(initialAllocations);
  const [totalBudget, setTotalBudget] = useState(300000);
  const [isEditing, setIsEditing] = useState<number | null>(null);

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
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 shadow-sm transition-colors">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

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
          <button className="text-sm text-purple-600 font-medium hover:text-purple-800 flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Add Department
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
                    {isEditing === item.id ? (
                      <input
                        type="number"
                        className="w-16 px-2 py-1 border rounded text-sm"
                        defaultValue={item.allocated}
                      />
                    ) : (
                      item.allocated + '%'
                    )}
                  </td>
                  <td className="px-3 py-2 font-semibold">{formatCurrency(item.amount)}</td>
                  <td className="px-3 py-2 text-gray-500">{formatCurrency(item.spend)}</td>
                  <td className="px-3 py-2 font-medium text-green-600">{formatCurrency(item.amount - item.spend)}</td>
                  <td className="px-3 py-2 text-right flex items-center justify-end gap-2">
                    {isEditing === item.id ? (
                      <button
                        className="text-green-600 hover:text-green-800 p-1"
                        onClick={() => setIsEditing(null)}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        className="text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => setIsEditing(item.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
