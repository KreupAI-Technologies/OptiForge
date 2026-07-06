'use client';

import React, { useState, useEffect } from 'react';
import { LogisticsService } from '@/services/logistics.service';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Truck,
  Fuel,
  Package,
  Users,
  AlertCircle,
  Download,
  Filter,
  PieChart,
  BarChart3
} from 'lucide-react';

interface SpendMetrics {
  period: string;
  totalSpend: number; // ₹
  transportationCost: number; // ₹
  fuelCost: number; // ₹
  driverCost: number; // ₹
  maintenanceCost: number; // ₹
  tollsAndFees: number; // ₹
  insuranceCost: number; // ₹
  otherCosts: number; // ₹
  costPerDelivery: number; // ₹
  costPerKm: number; // ₹
  budgetUtilization: number; // percentage
}

interface CategorySpend {
  id: number;
  category: string;
  currentSpend: number; // ₹
  previousSpend: number; // ₹
  budget: number; // ₹
  percentage: number; // of total
  change: number; // percentage change
  status: 'under-budget' | 'on-budget' | 'over-budget';
}

interface VendorSpend {
  id: number;
  vendorName: string;
  vendorType: string;
  totalSpend: number; // ₹
  invoiceCount: number;
  avgInvoiceValue: number; // ₹
  onTimePayment: number; // percentage
  discountsReceived: number; // ₹
  rating: number; // out of 5
  status: 'active' | 'inactive';
}

interface MonthlyTrend {
  month: string;
  totalSpend: number;
  transportation: number;
  fuel: number;
  maintenance: number;
  other: number;
}

export default function SpendAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-6-months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');

  const currentMetrics: SpendMetrics = {
    period: 'Last 6 Months',
    totalSpend: 165420000,
    transportationCost: 82710000,
    fuelCost: 45495600,
    driverCost: 19850400,
    maintenanceCost: 9925200,
    tollsAndFees: 4962600,
    insuranceCost: 1654200,
    otherCosts: 821800,
    costPerDelivery: 14950,
    costPerKm: 45.2,
    budgetUtilization: 87.3
  };

  const previousMetrics: SpendMetrics = {
    period: 'Previous 6 Months',
    totalSpend: 158940000,
    transportationCost: 79470000,
    fuelCost: 47682000,
    driverCost: 19073400,
    maintenanceCost: 7947000,
    tollsAndFees: 3178800,
    insuranceCost: 1589400,
    otherCosts: 0,
    costPerDelivery: 15120,
    costPerKm: 47.8,
    budgetUtilization: 92.8
  };

  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([
    {
      id: 1,
      category: 'Transportation & Freight',
      currentSpend: 82710000,
      previousSpend: 79470000,
      budget: 90000000,
      percentage: 50.0,
      change: 4.1,
      status: 'under-budget'
    },
    {
      id: 2,
      category: 'Fuel & Energy',
      currentSpend: 45495600,
      previousSpend: 47682000,
      budget: 48000000,
      percentage: 27.5,
      change: -4.6,
      status: 'under-budget'
    },
    {
      id: 3,
      category: 'Driver Salaries & Benefits',
      currentSpend: 19850400,
      previousSpend: 19073400,
      budget: 20000000,
      percentage: 12.0,
      change: 4.1,
      status: 'on-budget'
    },
    {
      id: 4,
      category: 'Vehicle Maintenance',
      currentSpend: 9925200,
      previousSpend: 7947000,
      budget: 8000000,
      percentage: 6.0,
      change: 24.9,
      status: 'over-budget'
    },
    {
      id: 5,
      category: 'Tolls & Road Fees',
      currentSpend: 4962600,
      previousSpend: 3178800,
      budget: 4000000,
      percentage: 3.0,
      change: 56.1,
      status: 'over-budget'
    },
    {
      id: 6,
      category: 'Insurance',
      currentSpend: 1654200,
      previousSpend: 1589400,
      budget: 2000000,
      percentage: 1.0,
      change: 4.1,
      status: 'under-budget'
    },
    {
      id: 7,
      category: 'Other Costs',
      currentSpend: 821800,
      previousSpend: 0,
      budget: 500000,
      percentage: 0.5,
      change: 100.0,
      status: 'over-budget'
    }
  ]);

  const [vendorSpend, setVendorSpend] = useState<VendorSpend[]>([
    {
      id: 1,
      vendorName: 'Indian Oil Corporation',
      vendorType: 'Fuel Supplier',
      totalSpend: 28547100,
      invoiceCount: 156,
      avgInvoiceValue: 183020,
      onTimePayment: 98.5,
      discountsReceived: 570942,
      rating: 4.8,
      status: 'active'
    },
    {
      id: 2,
      vendorName: 'Bharat Petroleum',
      vendorType: 'Fuel Supplier',
      totalSpend: 16948500,
      invoiceCount: 98,
      avgInvoiceValue: 172945,
      onTimePayment: 96.9,
      discountsReceived: 338970,
      rating: 4.6,
      status: 'active'
    },
    {
      id: 3,
      vendorName: 'VRL Logistics',
      vendorType: 'Transport Partner',
      totalSpend: 24813000,
      invoiceCount: 124,
      avgInvoiceValue: 200105,
      onTimePayment: 94.4,
      discountsReceived: 496260,
      rating: 4.5,
      status: 'active'
    },
    {
      id: 4,
      vendorName: 'Blue Dart Express',
      vendorType: 'Courier Service',
      totalSpend: 18609750,
      invoiceCount: 245,
      avgInvoiceValue: 75957,
      onTimePayment: 99.2,
      discountsReceived: 372195,
      rating: 4.7,
      status: 'active'
    },
    {
      id: 5,
      vendorName: 'ABC Vehicle Services',
      vendorType: 'Maintenance Provider',
      totalSpend: 8271000,
      invoiceCount: 68,
      avgInvoiceValue: 121632,
      onTimePayment: 91.2,
      discountsReceived: 165420,
      rating: 4.2,
      status: 'active'
    },
    {
      id: 6,
      vendorName: 'XYZ Auto Parts',
      vendorType: 'Parts Supplier',
      totalSpend: 1654200,
      invoiceCount: 142,
      avgInvoiceValue: 11650,
      onTimePayment: 88.0,
      discountsReceived: 33084,
      rating: 4.0,
      status: 'active'
    },
    {
      id: 7,
      vendorName: 'National Insurance Company',
      vendorType: 'Insurance Provider',
      totalSpend: 1654200,
      invoiceCount: 12,
      avgInvoiceValue: 137850,
      onTimePayment: 100.0,
      discountsReceived: 0,
      rating: 4.5,
      status: 'active'
    },
    {
      id: 8,
      vendorName: 'Highway Toll Services',
      vendorType: 'Toll Operator',
      totalSpend: 4962600,
      invoiceCount: 1,
      avgInvoiceValue: 4962600,
      onTimePayment: 100.0,
      discountsReceived: 0,
      rating: 4.0,
      status: 'active'
    }
  ]);

  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([
    {
      month: 'Apr 2024',
      totalSpend: 25650000,
      transportation: 12825000,
      fuel: 7695000,
      maintenance: 1539000,
      other: 3591000
    },
    {
      month: 'May 2024',
      totalSpend: 26460000,
      transportation: 13230000,
      fuel: 7938000,
      maintenance: 1587600,
      other: 3704400
    },
    {
      month: 'Jun 2024',
      totalSpend: 27120000,
      transportation: 13560000,
      fuel: 8136000,
      maintenance: 1627200,
      other: 3796800
    },
    {
      month: 'Jul 2024',
      totalSpend: 27540000,
      transportation: 13770000,
      fuel: 8262000,
      maintenance: 1652400,
      other: 3855600
    },
    {
      month: 'Aug 2024',
      totalSpend: 28230000,
      transportation: 14115000,
      fuel: 8469000,
      maintenance: 1693800,
      other: 3952200
    },
    {
      month: 'Sep 2024',
      totalSpend: 30420000,
      transportation: 15210000,
      fuel: 9126000,
      maintenance: 1825200,
      other: 4258800
    }
  ]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const spend = await LogisticsService.getFreightSpend();
        // byParty is a Record<partyName, totalSpend> (see getFreightSpendAnalysis).
        // Normalize to a { name, value } list, then map into VendorSpend fields.
        const partyEntries: Array<{ name: string; value: number }> = Array.isArray(
          spend?.byParty,
        )
          ? spend.byParty.map((p: any) => ({
              name: p?.name ?? p?.partyName ?? 'Unknown',
              value: Number(p?.value ?? p?.totalSpend ?? p?.totalAmount ?? 0),
            }))
          : spend?.byParty && typeof spend.byParty === 'object'
            ? Object.entries(spend.byParty as Record<string, number>).map(
                ([name, value]) => ({ name, value: Number(value) || 0 }),
              )
            : [];

        if (partyEntries.length > 0) {
          const mapped: VendorSpend[] = partyEntries.map((party, idx) => ({
            id: idx + 1,
            vendorName: party.name,
            vendorType: 'Freight Vendor',
            totalSpend: party.value,
            invoiceCount: 0,
            avgInvoiceValue: 0,
            onTimePayment: 0,
            discountsReceived: 0,
            rating: 0,
            status: 'active',
          }));
          if (mounted) setVendorSpend(mapped);
        }
      } catch {
        // On error keep the existing seed so the UI is not empty.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'under-budget': 'text-green-600 bg-green-50 border-green-200',
      'on-budget': 'text-blue-600 bg-blue-50 border-blue-200',
      'over-budget': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTrendIcon = (current: number, previous: number, reverse: boolean = false) => {
    const change = current - previous;
    if (reverse) {
      return change < 0 ? <TrendingDown className="w-4 h-4 text-green-600" /> : <TrendingUp className="w-4 h-4 text-red-600" />;
    }
    return change > 0 ? <TrendingUp className="w-4 h-4 text-red-600" /> : <TrendingDown className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span>Spend Analytics</span>
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive logistics spend analysis and cost optimization</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
            <option value="ytd">Year to Date</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="transportation">Transportation</option>
            <option value="fuel">Fuel</option>
            <option value="maintenance">Maintenance</option>
            <option value="driver">Driver Costs</option>
            <option value="other">Other</option>
          </select>

          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Vendors</option>
            <option value="fuel">Fuel Suppliers</option>
            <option value="transport">Transport Partners</option>
            <option value="maintenance">Maintenance Providers</option>
          </select>

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="flex items-center space-x-1">
              {getTrendIcon(currentMetrics.totalSpend, previousMetrics.totalSpend, true)}
              <span className="text-sm text-green-600">
                {Math.abs(parseFloat(calculateChange(currentMetrics.totalSpend, previousMetrics.totalSpend)))}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-900">₹{(currentMetrics.totalSpend / 10000000).toFixed(1)}Cr</div>
          <div className="text-sm font-medium text-green-700">Total Logistics Spend</div>
          <div className="text-xs text-green-600 mt-1">{currentMetrics.budgetUtilization}% of budget</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="flex items-center space-x-1">
              {getTrendIcon(previousMetrics.costPerDelivery, currentMetrics.costPerDelivery, true)}
              <span className="text-sm text-blue-600">
                {Math.abs(parseFloat(calculateChange(currentMetrics.costPerDelivery, previousMetrics.costPerDelivery)))}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900">₹{currentMetrics.costPerDelivery.toLocaleString()}</div>
          <div className="text-sm font-medium text-blue-700">Cost per Delivery</div>
          <div className="text-xs text-blue-600 mt-1">₹{currentMetrics.costPerKm}/km average</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Fuel className="w-8 h-8 text-orange-600" />
            <div className="flex items-center space-x-1">
              {getTrendIcon(currentMetrics.fuelCost, previousMetrics.fuelCost, true)}
              <span className="text-sm text-orange-600">
                {Math.abs(parseFloat(calculateChange(currentMetrics.fuelCost, previousMetrics.fuelCost)))}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-900">₹{(currentMetrics.fuelCost / 10000000).toFixed(1)}Cr</div>
          <div className="text-sm font-medium text-orange-700">Fuel Costs</div>
          <div className="text-xs text-orange-600 mt-1">{((currentMetrics.fuelCost/currentMetrics.totalSpend)*100).toFixed(1)}% of total spend</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-purple-600" />
            <div className="flex items-center space-x-1">
              {getTrendIcon(currentMetrics.transportationCost, previousMetrics.transportationCost, true)}
              <span className="text-sm text-purple-600">
                {Math.abs(parseFloat(calculateChange(currentMetrics.transportationCost, previousMetrics.transportationCost)))}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-900">₹{(currentMetrics.transportationCost / 10000000).toFixed(1)}Cr</div>
          <div className="text-sm font-medium text-purple-700">Transportation Costs</div>
          <div className="text-xs text-purple-600 mt-1">{((currentMetrics.transportationCost/currentMetrics.totalSpend)*100).toFixed(1)}% of total spend</div>
        </div>
      </div>

      {/* Spend Trends */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Spend Trends</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">Transportation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-600">Fuel</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Maintenance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-gray-600">Other</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {monthlyTrends.map((trend, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 w-24">{trend.month}</span>
                <span className="font-semibold text-gray-900">₹{(trend.totalSpend / 10000000).toFixed(2)}Cr</span>
              </div>
              <div className="flex items-center space-x-1 h-8">
                <div 
                  className="bg-purple-500 h-full rounded-l flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${(trend.transportation / trend.totalSpend) * 100}%` }}
                  title={`Transportation: ₹${(trend.transportation / 10000000).toFixed(2)}Cr`}
                >
                  {((trend.transportation / trend.totalSpend) * 100).toFixed(0)}%
                </div>
                <div 
                  className="bg-orange-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${(trend.fuel / trend.totalSpend) * 100}%` }}
                  title={`Fuel: ₹${(trend.fuel / 10000000).toFixed(2)}Cr`}
                >
                  {((trend.fuel / trend.totalSpend) * 100).toFixed(0)}%
                </div>
                <div 
                  className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${(trend.maintenance / trend.totalSpend) * 100}%` }}
                  title={`Maintenance: ₹${(trend.maintenance / 10000000).toFixed(2)}Cr`}
                >
                  {((trend.maintenance / trend.totalSpend) * 100).toFixed(0)}%
                </div>
                <div 
                  className="bg-gray-500 h-full rounded-r flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${(trend.other / trend.totalSpend) * 100}%` }}
                  title={`Other: ₹${(trend.other / 10000000).toFixed(2)}Cr`}
                >
                  {((trend.other / trend.totalSpend) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Spend Analysis */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Spend by Category</h2>
          <p className="text-sm text-gray-600 mt-1">Budget utilization and variance analysis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Spend</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorySpend.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{category.category}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">₹{(category.currentSpend / 10000000).toFixed(2)}Cr</div>
                    <div className="text-xs text-gray-500">Previous: ₹{(category.previousSpend / 10000000).toFixed(2)}Cr</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    ₹{(category.budget / 10000000).toFixed(2)}Cr
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {((category.currentSpend / category.budget) * 100).toFixed(1)}%
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          (category.currentSpend / category.budget) > 1 ? 'bg-red-500' :
                          (category.currentSpend / category.budget) > 0.95 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(((category.currentSpend / category.budget) * 100), 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {category.percentage.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className={`flex items-center space-x-1 ${category.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {category.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-sm font-medium">{Math.abs(category.change).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(category.status)}`}>
                      {category.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Spend */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Vendors by Spend</h2>
          <p className="text-sm text-gray-600 mt-1">Vendor performance and payment analysis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Invoice</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time Payment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounts</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendorSpend.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{vendor.vendorName}</div>
                    <div className="text-sm text-gray-600">{vendor.vendorType}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">₹{(vendor.totalSpend / 10000000).toFixed(2)}Cr</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {vendor.invoiceCount}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    ₹{vendor.avgInvoiceValue.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{vendor.onTimePayment}%</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-green-600">₹{vendor.discountsReceived.toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium text-gray-900">{vendor.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Cost Optimization</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Identify cost-saving opportunities through spend pattern analysis and vendor optimization.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Category-wise spend analysis</div>
            <div>• Budget variance tracking</div>
            <div>• Trend-based forecasting</div>
            <div>• Cost reduction opportunities</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Vendor Management</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Track vendor performance, payment patterns, and leverage discounts for better cost management.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Vendor spend concentration</div>
            <div>• Payment performance tracking</div>
            <div>• Discount utilization analysis</div>
            <div>• Vendor rating and selection</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Budget Planning</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Plan budgets based on historical trends, seasonal patterns, and business growth projections.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Historical spend patterns</div>
            <div>• Budget allocation optimization</div>
            <div>• Variance analysis and alerts</div>
            <div>• Forecasting and planning</div>
          </div>
        </div>
      </div>
    </div>
  );
}
