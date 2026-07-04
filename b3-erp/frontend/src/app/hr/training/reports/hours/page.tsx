'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Filter,
  Download,
  Calendar,
  BarChart as BarChartIcon,
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock Data
const monthlyHoursData = [
  { month: 'Jan', technical: 120, softSkills: 40, compliance: 20 },
  { month: 'Feb', technical: 150, softSkills: 50, compliance: 10 },
  { month: 'Mar', technical: 180, softSkills: 60, compliance: 30 },
  { month: 'Apr', technical: 200, softSkills: 80, compliance: 40 },
  { month: 'May', technical: 170, softSkills: 70, compliance: 20 },
  { month: 'Jun', technical: 220, softSkills: 90, compliance: 15 },
];

const trainingTypeData = [
  { name: 'Online Courses', value: 450, color: '#8b5cf6' },
  { name: 'Workshops', value: 300, color: '#ec4899' },
  { name: 'On-the-Job', value: 250, color: '#f59e0b' },
  { name: 'Seminars', value: 150, color: '#3b82f6' },
];

export default function TrainingHoursPage() {
  const [timeRange, setTimeRange] = useState('Last 6 Months');

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-8 w-8 text-purple-600" />
            Training Hours Analysis
          </h1>
          <p className="text-gray-500 mt-1">Track training volume and engagement over time</p>
        </div>
        <div className="flex gap-3">
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>Last 6 Months</option>
            <option>Year to Date</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-center">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Total Training Hours</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">1,150</p>
          <p className="text-xs text-green-600 mt-1">+12% vs last period</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-center">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Avg Hours / Employee</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">24.5</p>
          <p className="text-xs text-green-600 mt-1">Target: 20.0</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-center">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Peak Month</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">June</p>
          <p className="text-xs text-gray-400 mt-1">325 hours logged</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-center">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Most Popular Type</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">Online Courses</p>
          <p className="text-xs text-gray-400 mt-1">39% of total time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Monthly Training Volume Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyHoursData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSoft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="technical" stackId="1" stroke="#8b5cf6" fill="url(#colorTech)" name="Technical Skills" />
                <Area type="monotone" dataKey="softSkills" stackId="1" stroke="#ec4899" fill="url(#colorSoft)" name="Soft Skills" />
                <Area type="monotone" dataKey="compliance" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Compliance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training Type Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2 w-full text-left">Hours by Training Type</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trainingTypeData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trainingTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
