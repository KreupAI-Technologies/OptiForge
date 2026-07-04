'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Users,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Mock Data
const costPerEmployeeData = [
  { month: 'Jan', cost: 120 },
  { month: 'Feb', cost: 145 },
  { month: 'Mar', cost: 130 },
  { month: 'Apr', cost: 180 },
  { month: 'May', cost: 160 },
  { month: 'Jun', cost: 155 },
];

interface VendorSpend {
  name: string;
  value: number;
  color: string;
}

const VENDOR_COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981'];

const optimizationInsights = [
  { id: 1, title: 'Consolidate Vendor Licenses', impact: 'High', savings: '$12,000/yr', description: 'Merging Coursera and LinkedIn Learning licenses could reduce overhead.' },
  { id: 2, title: 'Early Bird Conference Booking', impact: 'Medium', savings: '$5,000/yr', description: 'Booking annual summits 3 months in advance secures 20% discount.' },
  { id: 3, title: 'Switch to Annual Billing', impact: 'Low', savings: '$2,500/yr', description: 'Moving monthly SaaS subscriptions to annual plans.' },
];

export default function CostsPage() {
  const [timeRange, setTimeRange] = useState('YTD');
  const [vendorSpendData, setVendorSpendData] = useState<VendorSpend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.expenseBudgets()) as any[];
        const mapped: VendorSpend[] = (Array.isArray(raw) ? raw : []).map((r, i) => ({
          name: r.name ?? r.vendor ?? r.category ?? r.department ?? '',
          value: Number(r.value ?? r.amount ?? r.spend ?? r.spent ?? 0),
          color: r.color ?? VENDOR_COLORS[i % VENDOR_COLORS.length],
        }));
        if (!cancelled) setVendorSpendData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load vendor spend');
          setVendorSpendData([]);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            Training Cost Analysis
          </h1>
          <p className="text-gray-500 mt-1">Deep dive into training expenses and ROI</p>
        </div>
        <div className="flex gap-3">
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>Year to Date (YTD)</option>
            <option>Last Quarter</option>
            <option>Last Year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Avg. Cost per Employee</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900">$1,250</h2>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +5%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Industry Avg: $1,100</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Cost per Training Hour</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900">$45</h2>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" /> -12%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Previous Year: $51</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Potential Savings</h3>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900">$19,500</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
              Identified
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">See optimization insights below</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Cost Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Cost per Employee Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costPerEmployeeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} formatter={(val: number) => [`$${val}`, 'Avg Cost']} />
                <Area type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Spend Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-full sm:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vendorSpendData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vendorSpendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-1/2 space-y-3">
            <h3 className="font-bold text-gray-900 mb-2">Vendor Spend Top 5</h3>
            {vendorSpendData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optimization Insights */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Cost Optimization Insights
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {optimizationInsights.map((insight) => (
            <div key={insight.id} className="p-4 border rounded-xl bg-gray-50 border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${insight.impact === 'High' ? 'bg-green-100 text-green-700' :
                    insight.impact === 'Medium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-200 text-gray-700'
                  }`}>
                  {insight.impact} Impact
                </span>
                <span className="text-sm font-bold text-gray-900">{insight.savings}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{insight.title}</h4>
              <p className="text-sm text-gray-600">{insight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
