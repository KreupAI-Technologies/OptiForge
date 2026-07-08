'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  MapPin,
  Truck,
  Package,
  Clock,
  DollarSign,
  Target,
  Download,
  Play,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';
import { routeService } from '@/services/route.service';
import { toast } from '@/hooks/use-toast';

interface OptimizationMetric {
  name: string;
  current: number;
  optimized: number;
  improvement: number; // percentage
  unit: string;
  status: 'excellent' | 'good' | 'needs-improvement';
}

interface RouteOptimization {
  id: number;
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  currentDistance: number; // km
  optimizedDistance: number; // km
  distanceSaving: number; // km
  currentTime: number; // hours
  optimizedTime: number; // hours
  timeSaving: number; // hours
  currentCost: number; // ₹
  optimizedCost: number; // ₹
  costSaving: number; // ₹
  savingPercentage: number;
  recommendation: string;
  status: 'pending' | 'implemented' | 'rejected';
}

interface LoadOptimization {
  id: number;
  vehicleType: string;
  currentUtilization: number; // percentage
  optimizedUtilization: number; // percentage
  improvement: number; // percentage
  currentTrips: number;
  optimizedTrips: number;
  tripReduction: number;
  costSaving: number; // ₹
  recommendation: string;
}

interface DriverOptimization {
  id: number;
  driverName: string;
  currentTripsPerMonth: number;
  optimizedTripsPerMonth: number;
  currentUtilization: number; // percentage
  optimizedUtilization: number; // percentage
  improvement: number; // percentage
  potentialRevenue: number; // ₹
  recommendation: string;
}

export default function OptimizationAnalyticsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = () => {
    setIsExporting(true);

    setTimeout(() => {
      // Export optimization metrics
      const metricsHeaders = ['Metric Name', 'Current Value', 'Optimized Value', 'Improvement %', 'Unit', 'Status'];
      const metricsRows = metrics.map(m => [
        m.name,
        m.current.toString(),
        m.optimized.toString(),
        m.improvement.toFixed(2),
        m.unit,
        m.status
      ]);

      // Export route optimizations
      const routeHeaders = ['Route Name', 'Origin', 'Destination', 'Current Distance (km)', 'Optimized Distance (km)',
        'Distance Saving (km)', 'Current Time (h)', 'Optimized Time (h)', 'Time Saving (h)',
        'Current Cost (₹)', 'Optimized Cost (₹)', 'Cost Saving (₹)', 'Saving %', 'Recommendation', 'Status'];
      const routeRows = routeOptimizations.map(r => [
        r.routeName,
        r.origin,
        r.destination,
        r.currentDistance.toString(),
        r.optimizedDistance.toString(),
        r.distanceSaving.toString(),
        r.currentTime.toString(),
        r.optimizedTime.toString(),
        r.timeSaving.toString(),
        r.currentCost.toString(),
        r.optimizedCost.toString(),
        r.costSaving.toString(),
        r.savingPercentage.toString(),
        r.recommendation,
        r.status
      ]);

      // Export load optimizations
      const loadHeaders = ['Vehicle Type', 'Current Utilization %', 'Optimized Utilization %', 'Improvement %',
        'Current Trips', 'Optimized Trips', 'Trip Reduction', 'Cost Saving (₹)', 'Recommendation'];
      const loadRows = loadOptimizations.map(l => [
        l.vehicleType,
        l.currentUtilization.toString(),
        l.optimizedUtilization.toString(),
        l.improvement.toString(),
        l.currentTrips.toString(),
        l.optimizedTrips.toString(),
        l.tripReduction.toString(),
        l.costSaving.toString(),
        l.recommendation
      ]);

      // Export driver optimizations
      const driverHeaders = ['Driver Name', 'Current Trips/Month', 'Optimized Trips/Month', 'Current Utilization %',
        'Optimized Utilization %', 'Improvement %', 'Potential Revenue (₹)', 'Recommendation'];
      const driverRows = driverOptimizations.map(d => [
        d.driverName,
        d.currentTripsPerMonth.toString(),
        d.optimizedTripsPerMonth.toString(),
        d.currentUtilization.toString(),
        d.optimizedUtilization.toString(),
        d.improvement.toString(),
        d.potentialRevenue.toString(),
        d.recommendation
      ]);

      // Combine all data into a single CSV
      const csvSections = [
        'LOGISTICS OPTIMIZATION REPORT',
        `Generated: ${new Date().toLocaleString()}`,
        '',
        'SUMMARY',
        `Total Potential Savings,₹${totalSavings.toLocaleString()}`,
        `Route Optimization Savings,₹${totalRouteSavings.toLocaleString()}`,
        `Load Optimization Savings,₹${totalLoadSavings.toLocaleString()}`,
        `Driver Optimization Revenue,₹${totalDriverRevenue.toLocaleString()}`,
        '',
        'OPTIMIZATION METRICS',
        metricsHeaders.join(','),
        ...metricsRows.map(row => row.join(',')),
        '',
        'ROUTE OPTIMIZATION RECOMMENDATIONS',
        routeHeaders.join(','),
        ...routeRows.map(row => row.join(',')),
        '',
        'LOAD OPTIMIZATION',
        loadHeaders.join(','),
        ...loadRows.map(row => row.join(',')),
        '',
        'DRIVER UTILIZATION OPTIMIZATION',
        driverHeaders.join(','),
        ...driverRows.map(row => row.join(','))
      ];

      const csvContent = csvSections.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Logistics_Optimization_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      toast({ title: 'Report exported', description: 'The logistics optimization report was downloaded as CSV.', variant: 'success' });
    }, 500);
  };

  const [implementingId, setImplementingId] = useState<number | null>(null);

  const handleImplementOptimization = async (route: RouteOptimization) => {
    if (!route.routeId) {
      toast({
        title: 'Cannot implement',
        description: 'This route has no backend identifier; optimization cannot be applied.',
        variant: 'destructive',
      });
      return;
    }
    const confirmed = confirm(
      `Implement route optimization for "${route.routeName}" (${route.origin} → ${route.destination})?\n\n` +
      `Projected cost saving: ₹${route.costSaving.toLocaleString()} (${route.savingPercentage}%).\n\n` +
      `This calls the route optimization service to recalculate and apply the optimized route.`
    );
    if (!confirmed) return;

    setImplementingId(route.id);
    try {
      await routeService.optimizeRoute(route.routeId);
      setRouteOptimizations(prev =>
        prev.map(r => (r.id === route.id ? { ...r, status: 'implemented' as const } : r)),
      );
      toast({
        title: 'Optimization implemented',
        description: `${route.routeName} was optimized. Est. monthly saving ₹${(route.costSaving * 4).toLocaleString()}.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Implementation failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setImplementingId(null);
    }
  };

  const [metrics, setMetrics] = useState<OptimizationMetric[]>([
    {
      name: 'Route Efficiency',
      current: 78.5,
      optimized: 92.3,
      improvement: 17.6,
      unit: '%',
      status: 'needs-improvement'
    },
    {
      name: 'Load Utilization',
      current: 72.8,
      optimized: 88.5,
      improvement: 21.6,
      unit: '%',
      status: 'needs-improvement'
    },
    {
      name: 'Fleet Utilization',
      current: 85.2,
      optimized: 93.7,
      improvement: 10.0,
      unit: '%',
      status: 'good'
    },
    {
      name: 'Driver Productivity',
      current: 81.5,
      optimized: 89.2,
      improvement: 9.4,
      unit: '%',
      status: 'good'
    },
    {
      name: 'Fuel Efficiency',
      current: 5.2,
      optimized: 5.8,
      improvement: 11.5,
      unit: 'km/L',
      status: 'good'
    },
    {
      name: 'Cost per Delivery',
      current: 14950,
      optimized: 12560,
      improvement: 16.0,
      unit: '₹',
      status: 'needs-improvement'
    }
  ]);

  const [routeOptimizations, setRouteOptimizations] = useState<RouteOptimization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await LogisticsService.getRoutes()) as any[];
        const list = Array.isArray(raw) ? raw : [];
        const mapped: RouteOptimization[] = list.map((r, idx) => ({
          id: idx + 1,
          routeId: String(r?.id ?? r?.routeId ?? ''),
          routeName: r?.routeName ?? '',
          origin: r?.origin ?? '',
          destination: r?.destination ?? '',
          currentDistance: Number(r?.currentDistance ?? 0),
          optimizedDistance: Number(r?.optimizedDistance ?? 0),
          distanceSaving: Number(r?.distanceSaving ?? 0),
          currentTime: Number(r?.currentTime ?? 0),
          optimizedTime: Number(r?.optimizedTime ?? 0),
          timeSaving: Number(r?.timeSaving ?? 0),
          currentCost: Number(r?.currentCost ?? 0),
          optimizedCost: Number(r?.optimizedCost ?? 0),
          costSaving: Number(r?.costSaving ?? 0),
          savingPercentage: Number(r?.savingPercentage ?? 0),
          recommendation: r?.recommendation ?? '',
          status: (r?.status ?? 'pending') as RouteOptimization['status'],
        }));
        if (!cancelled) setRouteOptimizations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load routes');
          setRouteOptimizations([]);
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

  const [loadOptimizations, setLoadOptimizations] = useState<LoadOptimization[]>([
    {
      id: 1,
      vehicleType: '32-Ft Truck',
      currentUtilization: 68.5,
      optimizedUtilization: 85.2,
      improvement: 24.4,
      currentTrips: 45,
      optimizedTrips: 38,
      tripReduction: 7,
      costSaving: 105000,
      recommendation: 'Consolidate partial loads and optimize packing sequence'
    },
    {
      id: 2,
      vehicleType: '40-Ft Truck',
      currentUtilization: 75.8,
      optimizedUtilization: 90.5,
      improvement: 19.4,
      currentTrips: 32,
      optimizedTrips: 27,
      tripReduction: 5,
      costSaving: 95000,
      recommendation: 'Better load planning with multi-customer consolidation'
    },
    {
      id: 3,
      vehicleType: '20-Ft Container',
      currentUtilization: 82.3,
      optimizedUtilization: 92.8,
      improvement: 12.8,
      currentTrips: 78,
      optimizedTrips: 72,
      tripReduction: 6,
      costSaving: 54000,
      recommendation: 'Implement dynamic load allocation system'
    },
    {
      id: 4,
      vehicleType: '24-Ft Truck',
      currentUtilization: 71.2,
      optimizedUtilization: 87.6,
      improvement: 23.0,
      currentTrips: 56,
      optimizedTrips: 48,
      tripReduction: 8,
      costSaving: 88000,
      recommendation: 'Combine small deliveries into single trips'
    }
  ]);

  const [driverOptimizations, setDriverOptimizations] = useState<DriverOptimization[]>([
    {
      id: 1,
      driverName: 'Ramesh Sharma',
      currentTripsPerMonth: 26,
      optimizedTripsPerMonth: 32,
      currentUtilization: 86.7,
      optimizedUtilization: 95.2,
      improvement: 9.8,
      potentialRevenue: 360000,
      recommendation: 'Assign 6 additional trips per month during available hours'
    },
    {
      id: 2,
      driverName: 'Suresh Kumar',
      currentTripsPerMonth: 37,
      optimizedTripsPerMonth: 42,
      currentUtilization: 73.3,
      optimizedUtilization: 88.5,
      improvement: 20.7,
      potentialRevenue: 135000,
      recommendation: 'Optimize route assignments to reduce idle time'
    },
    {
      id: 3,
      driverName: 'Ganesh Patil',
      currentTripsPerMonth: 30,
      optimizedTripsPerMonth: 35,
      currentUtilization: 93.3,
      optimizedUtilization: 98.8,
      improvement: 5.9,
      potentialRevenue: 127500,
      recommendation: 'Utilize remaining available hours with short-haul trips'
    },
    {
      id: 4,
      driverName: 'Vijay Singh',
      currentTripsPerMonth: 22,
      optimizedTripsPerMonth: 28,
      currentUtilization: 83.3,
      optimizedUtilization: 95.7,
      improvement: 14.9,
      potentialRevenue: 300000,
      recommendation: 'Increase night shift utilization with long-haul routes'
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'excellent': 'text-green-600 bg-green-50 border-green-200',
      'good': 'text-blue-600 bg-blue-50 border-blue-200',
      'needs-improvement': 'text-orange-600 bg-orange-50 border-orange-200',
      'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'implemented': 'text-green-600 bg-green-50 border-green-200',
      'rejected': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
    }, 2000);
  };

  const totalRouteSavings = routeOptimizations.reduce((sum, r) => sum + r.costSaving, 0);
  const totalLoadSavings = loadOptimizations.reduce((sum, l) => sum + l.costSaving, 0);
  const totalDriverRevenue = driverOptimizations.reduce((sum, d) => sum + d.potentialRevenue, 0);
  const totalSavings = totalRouteSavings + totalLoadSavings + totalDriverRevenue;

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Zap className="w-8 h-8 text-purple-600" />
            <span>Logistics Optimization</span>
          </h1>
          <p className="text-gray-600 mt-1">AI-powered optimization recommendations for cost and efficiency</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleOptimize}
            disabled={isOptimizing}
            className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 ${isOptimizing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isOptimizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isOptimizing ? 'Optimizing...' : 'Run Optimization'}</span>
          </button>
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading routes…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Potential Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">₹{(totalSavings / 100000).toFixed(1)}L</div>
          <div className="text-sm font-medium text-green-700">Total Potential Savings</div>
          <div className="text-xs text-green-600 mt-1">Per month</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">₹{(totalRouteSavings / 1000).toFixed(0)}K</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Route Optimization</div>
          <div className="text-xs text-blue-600 mt-1">{routeOptimizations.length} routes analyzed</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">₹{(totalLoadSavings / 1000).toFixed(0)}K</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Load Optimization</div>
          <div className="text-xs text-purple-600 mt-1">{loadOptimizations.reduce((sum, l) => sum + l.tripReduction, 0)} trips saved</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">₹{(totalDriverRevenue / 1000).toFixed(0)}K</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Driver Optimization</div>
          <div className="text-xs text-orange-600 mt-1">Additional revenue potential</div>
        </div>
      </div>

      {/* Optimization Metrics */}
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Optimization Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.map((metric, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{metric.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(metric.status)}`}>
                  {metric.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current:</span>
                  <span className="font-semibold text-gray-900">
                    {metric.unit === '₹' ? '₹' : ''}{metric.current.toLocaleString()}{metric.unit === '₹' ? '' : metric.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Optimized:</span>
                  <span className="font-semibold text-green-600">
                    {metric.unit === '₹' ? '₹' : ''}{metric.optimized.toLocaleString()}{metric.unit === '₹' ? '' : metric.unit}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Improvement:</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-600">{metric.improvement.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Optimization */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Route Optimization Recommendations</h2>
          <p className="text-sm text-gray-600 mt-1">Optimize routes for distance, time, and cost savings</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance Saving</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Saving</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Saving</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routeOptimizations.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{route.routeName}</div>
                    <div className="text-sm text-gray-600">{route.origin} → {route.destination}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">{route.distanceSaving} km</div>
                    <div className="text-xs text-gray-500">{route.currentDistance} → {route.optimizedDistance} km</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-semibold text-blue-600">{route.timeSaving.toFixed(1)}h</div>
                    <div className="text-xs text-gray-500">{route.currentTime} → {route.optimizedTime}h</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">₹{route.costSaving.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{route.savingPercentage}% saving</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-700 max-w-xs">{route.recommendation}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(route.status)}`}>
                      {route.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {route.status === 'pending' && (
                      <button
                        onClick={() => handleImplementOptimization(route)}
                        disabled={implementingId === route.id}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {implementingId === route.id ? 'Implementing...' : 'Implement'}
                      </button>
                    )}
                    {route.status === 'implemented' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Load & Driver Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Load Optimization */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Load Optimization</h2>
            <p className="text-sm text-gray-600 mt-1">Improve vehicle load utilization</p>
          </div>
          <div className="p-6 space-y-2">
            {loadOptimizations.map((load) => (
              <div key={load.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{load.vehicleType}</h3>
                  <span className="text-sm font-bold text-green-600">
                    +{load.improvement.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Utilization:</span>
                    <span className="font-semibold text-gray-900">
                      {load.currentUtilization}% → {load.optimizedUtilization}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trip Reduction:</span>
                    <span className="font-semibold text-green-600">{load.tripReduction} trips</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cost Saving:</span>
                    <span className="font-bold text-green-600">₹{load.costSaving.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">{load.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Optimization */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Driver Utilization</h2>
            <p className="text-sm text-gray-600 mt-1">Maximize driver productivity</p>
          </div>
          <div className="p-6 space-y-2">
            {driverOptimizations.map((driver) => (
              <div key={driver.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{driver.driverName}</h3>
                  <span className="text-sm font-bold text-purple-600">
                    +{driver.improvement.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trips/Month:</span>
                    <span className="font-semibold text-gray-900">
                      {driver.currentTripsPerMonth} → {driver.optimizedTripsPerMonth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Utilization:</span>
                    <span className="font-semibold text-gray-900">
                      {driver.currentUtilization}% → {driver.optimizedUtilization}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Additional Revenue:</span>
                    <span className="font-bold text-purple-600">₹{driver.potentialRevenue.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">{driver.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">AI-Powered Optimization</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Machine learning algorithms analyze patterns and recommend optimal routes, loads, and resource allocation.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Real-time data analysis</div>
            <div>• Pattern recognition</div>
            <div>• Predictive optimization</div>
            <div>• Continuous learning</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Cost Reduction</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Identify and implement cost-saving opportunities across routes, loads, and resource utilization.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Route optimization savings</div>
            <div>• Load consolidation benefits</div>
            <div>• Resource utilization gains</div>
            <div>• Fuel efficiency improvements</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Performance Tracking</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Monitor implementation status and measure actual savings against projected improvements.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Implementation tracking</div>
            <div>• Savings verification</div>
            <div>• ROI measurement</div>
            <div>• Continuous improvement</div>
          </div>
        </div>
      </div>
    </div>
  );
}
