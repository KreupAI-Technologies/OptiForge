'use client';

import { useState, useMemo, useEffect } from 'react';
import { Target, Plus, Search, Filter, Edit, Trash2, TrendingUp } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { HrTalentService } from '@/services/hr-talent.service';

interface KPI {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'production' | 'quality' | 'safety' | 'efficiency' | 'customer' | 'financial';
  measurementType: 'percentage' | 'count' | 'time' | 'currency' | 'ratio';
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  targetValue: number;
  calculationFormula?: string;
  department: string;
  status: 'active' | 'inactive';
}

export default function KPIMasterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const mockKPIs: KPI[] = [
    {
      id: '1', code: 'PROD-001', name: 'Production Output Rate', description: 'Number of units produced per hour',
      category: 'production', measurementType: 'count', unit: 'units/hour', frequency: 'daily',
      targetValue: 120, department: 'Manufacturing', status: 'active'
    },
    {
      id: '2', code: 'QUAL-001', name: 'First Pass Yield', description: 'Percentage of products passing quality check on first attempt',
      category: 'quality', measurementType: 'percentage', unit: '%', frequency: 'daily',
      targetValue: 98, calculationFormula: '(Passed Units / Total Units) × 100', department: 'Quality Assurance', status: 'active'
    },
    {
      id: '3', code: 'QUAL-002', name: 'Defect Rate', description: 'Percentage of defective products',
      category: 'quality', measurementType: 'percentage', unit: '%', frequency: 'weekly',
      targetValue: 2, calculationFormula: '(Defective Units / Total Units) × 100', department: 'Quality Assurance', status: 'active'
    },
    {
      id: '4', code: 'SAFE-001', name: 'Safety Incident Rate', description: 'Number of safety incidents per month',
      category: 'safety', measurementType: 'count', unit: 'incidents', frequency: 'monthly',
      targetValue: 0, department: 'Safety & Compliance', status: 'active'
    },
    {
      id: '5', code: 'EFF-001', name: 'Overall Equipment Effectiveness', description: 'OEE percentage measuring equipment performance',
      category: 'efficiency', measurementType: 'percentage', unit: '%', frequency: 'daily',
      targetValue: 85, calculationFormula: 'Availability × Performance × Quality', department: 'Manufacturing', status: 'active'
    },
    {
      id: '6', code: 'EFF-002', name: 'Machine Downtime', description: 'Total hours of unplanned machine downtime',
      category: 'efficiency', measurementType: 'time', unit: 'hours', frequency: 'weekly',
      targetValue: 4, department: 'Maintenance', status: 'active'
    },
    {
      id: '7', code: 'PROD-002', name: 'Cycle Time', description: 'Average time to complete one production cycle',
      category: 'production', measurementType: 'time', unit: 'minutes', frequency: 'daily',
      targetValue: 25, department: 'Manufacturing', status: 'active'
    },
    {
      id: '8', code: 'QUAL-003', name: 'Customer Complaint Rate', description: 'Number of customer complaints per 1000 units',
      category: 'customer', measurementType: 'ratio', unit: 'complaints/1000 units', frequency: 'monthly',
      targetValue: 2, department: 'Quality Assurance', status: 'active'
    },
    {
      id: '9', code: 'EFF-003', name: 'Labor Productivity', description: 'Units produced per labor hour',
      category: 'efficiency', measurementType: 'ratio', unit: 'units/labor hour', frequency: 'weekly',
      targetValue: 15, department: 'Manufacturing', status: 'active'
    },
    {
      id: '10', code: 'PROD-003', name: 'Scrap Rate', description: 'Percentage of raw material wasted',
      category: 'production', measurementType: 'percentage', unit: '%', frequency: 'weekly',
      targetValue: 3, calculationFormula: '(Scrap Weight / Total Material Weight) × 100', department: 'Manufacturing', status: 'active'
    },
    {
      id: '11', code: 'FIN-001', name: 'Cost per Unit', description: 'Manufacturing cost per unit produced',
      category: 'financial', measurementType: 'currency', unit: '₹', frequency: 'monthly',
      targetValue: 450, department: 'Manufacturing', status: 'active'
    },
    {
      id: '12', code: 'SAFE-002', name: 'Near Miss Reports', description: 'Number of near-miss safety events reported',
      category: 'safety', measurementType: 'count', unit: 'reports', frequency: 'monthly',
      targetValue: 10, department: 'Safety & Compliance', status: 'active'
    },
    {
      id: '13', code: 'CUST-001', name: 'On-Time Delivery Rate', description: 'Percentage of orders delivered on time',
      category: 'customer', measurementType: 'percentage', unit: '%', frequency: 'monthly',
      targetValue: 95, calculationFormula: '(On-Time Deliveries / Total Deliveries) × 100', department: 'Warehouse & Logistics', status: 'active'
    },
    {
      id: '14', code: 'EFF-004', name: 'Energy Consumption per Unit', description: 'KWh consumed per unit produced',
      category: 'efficiency', measurementType: 'ratio', unit: 'kWh/unit', frequency: 'monthly',
      targetValue: 2.5, department: 'Manufacturing', status: 'active'
    }
  ];

  const [rows, setRows] = useState<KPI[]>(mockKPIs);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getPerformance<KPI>('kpi');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const departments = ['all', ...Array.from(new Set(rows.map(k => k.department)))];

  const filteredKPIs = useMemo(() => {
    return rows.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kpi.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
      const matchesDepartment = selectedDepartment === 'all' || kpi.department === selectedDepartment;
      return matchesSearch && matchesCategory && matchesDepartment;
    });
  }, [searchTerm, selectedCategory, selectedDepartment, rows]);

  const stats = {
    total: rows.length,
    production: rows.filter(k => k.category === 'production').length,
    quality: rows.filter(k => k.category === 'quality').length,
    safety: rows.filter(k => k.category === 'safety').length,
    efficiency: rows.filter(k => k.category === 'efficiency').length,
    active: rows.filter(k => k.status === 'active').length
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      production: 'bg-blue-100 text-blue-800',
      quality: 'bg-green-100 text-green-800',
      safety: 'bg-red-100 text-red-800',
      efficiency: 'bg-purple-100 text-purple-800',
      customer: 'bg-orange-100 text-orange-800',
      financial: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors];
  };

  const getFrequencyColor = (frequency: string) => {
    const colors = {
      daily: 'bg-indigo-100 text-indigo-800',
      weekly: 'bg-cyan-100 text-cyan-800',
      monthly: 'bg-teal-100 text-teal-800',
      quarterly: 'bg-emerald-100 text-emerald-800',
      yearly: 'bg-lime-100 text-lime-800'
    };
    return colors[frequency as keyof typeof colors];
  };

  const columns = [
    { key: 'code', label: 'KPI Code', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'name', label: 'KPI Name', sortable: true,
      render: (v: string, row: KPI) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    { key: 'category', label: 'Category', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(v)}`}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      )
    },
    { key: 'targetValue', label: 'Target', sortable: true,
      render: (v: number, row: KPI) => (
        <div className="text-sm font-semibold text-gray-900">{v} {row.unit}</div>
      )
    },
    { key: 'frequency', label: 'Frequency', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getFrequencyColor(v)}`}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      )
    },
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string) => <div className="text-sm text-gray-700">{v}</div>
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    },
    { key: 'id', label: 'Actions', sortable: false,
      render: () => (
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="h-8 w-8 text-emerald-600" />
          KPI Master
        </h1>
        <p className="text-gray-600 mt-2">Define and manage key performance indicators</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total KPIs</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.total}</p>
            </div>
            <Target className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Production</p>
              <p className="text-2xl font-bold text-blue-600">{stats.production}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quality</p>
              <p className="text-2xl font-bold text-green-600">{stats.quality}</p>
            </div>
            <Target className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Safety</p>
              <p className="text-2xl font-bold text-red-600">{stats.safety}</p>
            </div>
            <Target className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Efficiency</p>
              <p className="text-2xl font-bold text-purple-600">{stats.efficiency}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.active}</p>
            </div>
            <Target className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Add KPI
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="production">Production</option>
                <option value="quality">Quality</option>
                <option value="safety">Safety</option>
                <option value="efficiency">Efficiency</option>
                <option value="customer">Customer</option>
                <option value="financial">Financial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* KPI Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
        </div>
        <DataTable data={filteredKPIs} columns={columns} />
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-emerald-900 mb-2">KPI Categories</h3>
        <ul className="text-sm text-emerald-800 space-y-1">
          <li>• <strong>Production:</strong> Metrics related to manufacturing output and cycle times</li>
          <li>• <strong>Quality:</strong> Measures of product quality, defects, and customer satisfaction</li>
          <li>• <strong>Safety:</strong> Safety incidents, compliance, and workplace hazard tracking</li>
          <li>• <strong>Efficiency:</strong> Equipment effectiveness, downtime, and resource utilization</li>
          <li>• <strong>Customer:</strong> Delivery performance, complaints, and service levels</li>
          <li>• <strong>Financial:</strong> Cost metrics, profitability, and budget performance</li>
        </ul>
      </div>
    </div>
  );
}
