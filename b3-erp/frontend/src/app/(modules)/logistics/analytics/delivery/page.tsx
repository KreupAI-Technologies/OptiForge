'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Clock,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';

interface DeliveryMetrics {
  period: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  failedDeliveries: number;
  onTimePercentage: number;
  avgDeliveryTime: number; // hours
  totalDistance: number; // km
  avgDistance: number; // km
  totalCost: number; // ₹
  costPerDelivery: number; // ₹
  customerSatisfaction: number; // out of 5
}

interface RoutePerformance {
  id: number;
  routeName: string;
  origin: string;
  destination: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  avgDeliveryTime: number; // hours
  avgDistance: number; // km
  onTimePercentage: number;
  fuelEfficiency: number; // km/L
  avgCostPerTrip: number; // ₹
  rating: number; // out of 5
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

interface DeliveryTrend {
  month: string;
  total: number;
  onTime: number;
  late: number;
  failed: number;
  onTimePercentage: number;
}

export default function DeliveryAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');

  const currentMetrics: DeliveryMetrics = {
    period: 'Last 30 Days',
    totalDeliveries: 1842,
    onTimeDeliveries: 1703,
    lateDeliveries: 115,
    failedDeliveries: 24,
    onTimePercentage: 92.5,
    avgDeliveryTime: 18.5,
    totalDistance: 458900,
    avgDistance: 249,
    totalCost: 27534000,
    costPerDelivery: 14950,
    customerSatisfaction: 4.3
  };

  const previousMetrics: DeliveryMetrics = {
    period: 'Previous 30 Days',
    totalDeliveries: 1756,
    onTimeDeliveries: 1568,
    lateDeliveries: 142,
    failedDeliveries: 46,
    onTimePercentage: 89.3,
    avgDeliveryTime: 20.2,
    totalDistance: 442800,
    avgDistance: 252,
    totalCost: 26553600,
    costPerDelivery: 15120,
    customerSatisfaction: 4.1
  };

  const [trends, setTrends] = useState<DeliveryTrend[]>([
    {
      month: 'Apr 2024',
      total: 1654,
      onTime: 1428,
      late: 178,
      failed: 48,
      onTimePercentage: 86.3
    },
    {
      month: 'May 2024',
      total: 1702,
      onTime: 1487,
      late: 165,
      failed: 50,
      onTimePercentage: 87.4
    },
    {
      month: 'Jun 2024',
      total: 1756,
      onTime: 1568,
      late: 142,
      failed: 46,
      onTimePercentage: 89.3
    },
    {
      month: 'Jul 2024',
      total: 1798,
      onTime: 1612,
      late: 138,
      failed: 48,
      onTimePercentage: 89.6
    },
    {
      month: 'Aug 2024',
      total: 1820,
      onTime: 1656,
      late: 125,
      failed: 39,
      onTimePercentage: 91.0
    },
    {
      month: 'Sep 2024',
      total: 1842,
      onTime: 1703,
      late: 115,
      failed: 24,
      onTimePercentage: 92.5
    }
  ]);

  const [routePerformance, setRoutePerformance] = useState<RoutePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await LogisticsService.getShipments()) as any[];
        const list = Array.isArray(raw) ? raw : [];
        const mapped: RoutePerformance[] = list.map((r, idx) => ({
          id: idx + 1,
          routeName: r?.routeName ?? '',
          origin: r?.origin ?? '',
          destination: r?.destination ?? '',
          totalDeliveries: Number(r?.totalDeliveries ?? 0),
          onTimeDeliveries: Number(r?.onTimeDeliveries ?? 0),
          avgDeliveryTime: Number(r?.avgDeliveryTime ?? 0),
          avgDistance: Number(r?.avgDistance ?? 0),
          onTimePercentage: Number(r?.onTimePercentage ?? 0),
          fuelEfficiency: Number(r?.fuelEfficiency ?? 0),
          avgCostPerTrip: Number(r?.avgCostPerTrip ?? 0),
          rating: Number(r?.rating ?? 0),
          performance: (r?.performance ?? 'average') as RoutePerformance['performance'],
        }));
        if (!cancelled) setRoutePerformance(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load deliveries');
          setRoutePerformance([]);
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

  const getPerformanceColor = (performance: string) => {
    const colors: { [key: string]: string } = {
      'excellent': 'text-green-600 bg-green-50 border-green-200',
      'good': 'text-blue-600 bg-blue-50 border-blue-200',
      'average': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'poor': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[performance] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTrendIcon = (current: number, previous: number, reverse: boolean = false) => {
    const change = current - previous;
    if (reverse) {
      return change < 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return change > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span>Delivery Analytics</span>
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive delivery performance metrics and KPIs</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading deliveries…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Regions</option>
            <option value="north">North India</option>
            <option value="south">South India</option>
            <option value="east">East India</option>
            <option value="west">West India</option>
          </select>

          <select
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Vehicle Types</option>
            <option value="truck">Trucks</option>
            <option value="container">Containers</option>
            <option value="trailer">Trailers</option>
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
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="flex items-center space-x-1">
              {getTrendIcon(currentMetrics.onTimePercentage, previousMetrics.onTimePercentage)}
              <span className="text-sm text-green-600">
                {calculateChange(currentMetrics.onTimePercentage, previousMetrics.onTimePercentage)}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-900">{currentMetrics.onTimePercentage}%</div>
          <div className="text-sm font-medium text-green-700">On-Time Delivery Rate</div>
          <div className="text-xs text-green-600 mt-1">{currentMetrics.onTimeDeliveries} of {currentMetrics.totalDeliveries} deliveries</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="flex items-center space-x-1">
              {getTrendIcon(previousMetrics.avgDeliveryTime, currentMetrics.avgDeliveryTime, true)}
              <span className="text-sm text-blue-600">
                {Math.abs(parseFloat(calculateChange(currentMetrics.avgDeliveryTime, previousMetrics.avgDeliveryTime)))}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900">{currentMetrics.avgDeliveryTime}h</div>
          <div className="text-sm font-medium text-blue-700">Avg Delivery Time</div>
          <div className="text-xs text-blue-600 mt-1">Target: ≤20 hours</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-purple-600" />
            <div className="flex items-center space-x-1">
              {getTrendIcon(currentMetrics.totalDeliveries, previousMetrics.totalDeliveries)}
              <span className="text-sm text-purple-600">
                {calculateChange(currentMetrics.totalDeliveries, previousMetrics.totalDeliveries)}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-900">{currentMetrics.totalDeliveries.toLocaleString()}</div>
          <div className="text-sm font-medium text-purple-700">Total Deliveries</div>
          <div className="text-xs text-purple-600 mt-1">{currentMetrics.totalDistance.toLocaleString()} km covered</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div className="flex items-center space-x-1">
              {getTrendIcon(previousMetrics.failedDeliveries, currentMetrics.failedDeliveries, true)}
              <span className="text-sm text-orange-600">
                {Math.abs(parseFloat(calculateChange(currentMetrics.failedDeliveries, previousMetrics.failedDeliveries)))}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-900">{currentMetrics.failedDeliveries}</div>
          <div className="text-sm font-medium text-orange-700">Failed Deliveries</div>
          <div className="text-xs text-orange-600 mt-1">{((currentMetrics.failedDeliveries/currentMetrics.totalDeliveries)*100).toFixed(1)}% failure rate</div>
        </div>
      </div>

      {/* Delivery Trends Chart */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Delivery Performance Trends</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">On-Time</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Late</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Failed</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {trends.map((trend, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 w-24">{trend.month}</span>
                <span className="text-gray-600">{trend.total} deliveries</span>
                <span className="font-semibold text-green-600">{trend.onTimePercentage}% on-time</span>
              </div>
              <div className="flex items-center space-x-1 h-8">
                <div 
                  className="bg-green-500 h-full rounded-l flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${(trend.onTime / trend.total) * 100}%` }}
                >
                  {trend.onTime > 0 && trend.onTime}
                </div>
                <div 
                  className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${(trend.late / trend.total) * 100}%` }}
                >
                  {trend.late > 0 && trend.late}
                </div>
                <div 
                  className="bg-red-500 h-full rounded-r flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${(trend.failed / trend.total) * 100}%` }}
                >
                  {trend.failed > 0 && trend.failed}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Performance */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Route Performance Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Performance metrics by route</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliveries</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time %</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Distance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Efficiency</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routePerformance.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{route.routeName}</div>
                    <div className="text-sm text-gray-600">{route.origin} → {route.destination}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{route.totalDeliveries}</div>
                    <div className="text-xs text-green-600">{route.onTimeDeliveries} on-time</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-lg font-bold text-green-600">{route.onTimePercentage}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${route.onTimePercentage}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {route.avgDeliveryTime}h
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {route.avgDistance} km
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {route.fuelEfficiency} km/L
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    ₹{route.avgCostPerTrip.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium text-gray-900">{route.rating}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(route.performance)}`}>
                      {route.performance.toUpperCase()}
                    </span>
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
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">On-Time Performance</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Track on-time delivery rates with trend analysis and route-wise performance metrics.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Real-time on-time percentage tracking</div>
            <div>• Historical trend analysis</div>
            <div>• Route performance comparison</div>
            <div>• Driver performance impact</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Delivery Time Analysis</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Monitor average delivery times, delays, and identify bottlenecks in the delivery process.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Average delivery time by route</div>
            <div>• Delay pattern identification</div>
            <div>• Time zone impact analysis</div>
            <div>• Seasonal variations tracking</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Failure Analysis</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Analyze failed deliveries, identify root causes, and implement corrective actions.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Failed delivery tracking</div>
            <div>• Root cause analysis</div>
            <div>• Customer feedback integration</div>
            <div>• Corrective action monitoring</div>
          </div>
        </div>
      </div>
    </div>
  );
}
