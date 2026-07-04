'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Edit2,
  Eye,
  Search,
  Award,
  Star,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Fuel,
  DollarSign,
  Target,
  TrendingDown
} from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';

interface DriverPerformance {
  id: number;
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  vehicleType: string;
  employmentDate: string;
  totalExperience: number; // years
  period: string; // evaluation period
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  completionRate: number; // percentage
  totalDistance: number; // km
  avgTripDistance: number; // km
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimePercentage: number; // percentage
  avgDelay: number; // minutes
  totalRevenue: number; // ₹
  revenuePerTrip: number; // ₹
  revenuePerKm: number; // ₹
  fuelEfficiency: number; // km/liter
  avgFuelConsumption: number; // liters/trip
  fuelCostPerKm: number; // ₹
  safetyScore: number; // out of 100
  accidentsCount: number;
  violationsCount: number;
  incidentsCount: number;
  customerRating: number; // out of 5
  customerComplaints: number;
  customerCompliments: number;
  utilizationRate: number; // percentage
  averageSpeed: number; // km/h
  idleTime: number; // hours
  restCompliance: number; // percentage
  maintenanceAlerts: number;
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
  performanceScore: number; // out of 100
  strengths: string[];
  improvements: string[];
  awards: string[];
  penalties: string[];
  status: 'active' | 'probation' | 'suspended' | 'terminated';
}

export default function DriverPerformancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('performanceScore');

  const [performanceData, setPerformanceData] = useState<DriverPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await LogisticsService.getDrivers()) as any[];
        const list = Array.isArray(raw) ? raw : [];
        const mapped: DriverPerformance[] = list.map((r, idx) => ({
          id: idx + 1,
          driverId: r?.driverId ?? '',
          driverName: r?.driverName ?? '',
          vehicleNumber: r?.vehicleNumber ?? '',
          vehicleType: r?.vehicleType ?? '',
          employmentDate: r?.employmentDate ?? '',
          totalExperience: Number(r?.totalExperience ?? 0),
          period: r?.period ?? '',
          totalTrips: Number(r?.totalTrips ?? 0),
          completedTrips: Number(r?.completedTrips ?? 0),
          cancelledTrips: Number(r?.cancelledTrips ?? 0),
          completionRate: Number(r?.completionRate ?? 0),
          totalDistance: Number(r?.totalDistance ?? 0),
          avgTripDistance: Number(r?.avgTripDistance ?? 0),
          onTimeDeliveries: Number(r?.onTimeDeliveries ?? 0),
          lateDeliveries: Number(r?.lateDeliveries ?? 0),
          onTimePercentage: Number(r?.onTimePercentage ?? 0),
          avgDelay: Number(r?.avgDelay ?? 0),
          totalRevenue: Number(r?.totalRevenue ?? 0),
          revenuePerTrip: Number(r?.revenuePerTrip ?? 0),
          revenuePerKm: Number(r?.revenuePerKm ?? 0),
          fuelEfficiency: Number(r?.fuelEfficiency ?? 0),
          avgFuelConsumption: Number(r?.avgFuelConsumption ?? 0),
          fuelCostPerKm: Number(r?.fuelCostPerKm ?? 0),
          safetyScore: Number(r?.safetyScore ?? 0),
          accidentsCount: Number(r?.accidentsCount ?? 0),
          violationsCount: Number(r?.violationsCount ?? 0),
          incidentsCount: Number(r?.incidentsCount ?? 0),
          customerRating: Number(r?.customerRating ?? 0),
          customerComplaints: Number(r?.customerComplaints ?? 0),
          customerCompliments: Number(r?.customerCompliments ?? 0),
          utilizationRate: Number(r?.utilizationRate ?? 0),
          averageSpeed: Number(r?.averageSpeed ?? 0),
          idleTime: Number(r?.idleTime ?? 0),
          restCompliance: Number(r?.restCompliance ?? 0),
          maintenanceAlerts: Number(r?.maintenanceAlerts ?? 0),
          performanceRating: (r?.performanceRating ?? 'average') as DriverPerformance['performanceRating'],
          performanceScore: Number(r?.performanceScore ?? 0),
          strengths: Array.isArray(r?.strengths) ? r.strengths : [],
          improvements: Array.isArray(r?.improvements) ? r.improvements : [],
          awards: Array.isArray(r?.awards) ? r.awards : [],
          penalties: Array.isArray(r?.penalties) ? r.penalties : [],
          status: (r?.status ?? 'active') as DriverPerformance['status'],
        }));
        if (!cancelled) setPerformanceData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load drivers');
          setPerformanceData([]);
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

  const getRatingColor = (rating: string) => {
    const colors: { [key: string]: string } = {
      'excellent': 'text-green-600 bg-green-50 border-green-200',
      'good': 'text-blue-600 bg-blue-50 border-blue-200',
      'average': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'poor': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[rating] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'text-green-600 bg-green-50 border-green-200',
      'probation': 'text-orange-600 bg-orange-50 border-orange-200',
      'suspended': 'text-red-600 bg-red-50 border-red-200',
      'terminated': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalDrivers = performanceData.length;
  const avgPerformanceScore = performanceData.reduce((sum, d) => sum + d.performanceScore, 0) / totalDrivers;
  const excellentDrivers = performanceData.filter(d => d.performanceRating === 'excellent').length;
  const probationDrivers = performanceData.filter(d => d.status === 'probation').length;

  const filteredData = performanceData.filter(driver => {
    const matchesSearch = driver.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.driverId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = selectedRating === 'all' || driver.performanceRating === selectedRating;
    const matchesStatus = selectedStatus === 'all' || driver.status === selectedStatus;
    return matchesSearch && matchesRating && matchesStatus;
  });

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'performanceScore':
        return b.performanceScore - a.performanceScore;
      case 'onTimePercentage':
        return b.onTimePercentage - a.onTimePercentage;
      case 'safetyScore':
        return b.safetyScore - a.safetyScore;
      case 'customerRating':
        return b.customerRating - a.customerRating;
      default:
        return 0;
    }
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span>Driver Performance</span>
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive driver performance metrics and KPIs</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading drivers…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{avgPerformanceScore.toFixed(1)}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Avg Performance Score</div>
          <div className="text-xs text-green-600 mt-1">Out of 100</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{excellentDrivers}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Excellent Performers</div>
          <div className="text-xs text-blue-600 mt-1">≥90% Score</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{totalDrivers}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Total Drivers</div>
          <div className="text-xs text-purple-600 mt-1">Under Evaluation</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{probationDrivers}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">On Probation</div>
          <div className="text-xs text-orange-600 mt-1">Requires Attention</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Performance Ratings</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="poor">Poor</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="performanceScore">Sort by Performance Score</option>
            <option value="onTimePercentage">Sort by On-Time %</option>
            <option value="safetyScore">Sort by Safety Score</option>
            <option value="customerRating">Sort by Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Score</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Performance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Safety & Compliance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{driver.driverName}</div>
                    <div className="text-sm text-gray-600">{driver.driverId}</div>
                    <div className="text-xs text-gray-500 mt-1">{driver.vehicleNumber}</div>
                    <div className="text-xs text-gray-500">{driver.totalExperience}y exp • {driver.period}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(driver.performanceScore)}`}>
                      {driver.performanceScore}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-20 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          driver.performanceScore >= 90 ? 'bg-green-500' :
                          driver.performanceScore >= 75 ? 'bg-blue-500' :
                          driver.performanceScore >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${driver.performanceScore}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.completedTrips}/{driver.totalTrips} trips</div>
                    <div className="text-xs text-green-600">{driver.onTimePercentage.toFixed(1)}% on-time</div>
                    <div className="text-xs text-gray-600">{driver.totalDistance.toLocaleString()} km</div>
                    <div className="text-xs text-gray-500">Avg delay: {driver.avgDelay}min</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Safety: {driver.safetyScore}/100</div>
                    <div className="text-xs text-red-600">Accidents: {driver.accidentsCount}</div>
                    <div className="text-xs text-orange-600">Violations: {driver.violationsCount}</div>
                    <div className="text-xs text-yellow-600">Incidents: {driver.incidentsCount}</div>
                    <div className="text-xs text-blue-600">Rest: {driver.restCompliance}%</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">₹{(driver.totalRevenue / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-600">₹{driver.revenuePerTrip.toLocaleString()}/trip</div>
                    <div className="text-xs text-gray-600">₹{driver.revenuePerKm}/km</div>
                    <div className="text-xs text-green-600">{driver.fuelEfficiency} km/L</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{driver.customerRating.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-green-600">👍 {driver.customerCompliments}</div>
                    <div className="text-xs text-red-600">👎 {driver.customerComplaints}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRatingColor(driver.performanceRating)}`}>
                      {driver.performanceRating.toUpperCase()}
                    </span>
                    {driver.awards.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Award className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-600">{driver.awards.length} award(s)</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.status)}`}>
                      {driver.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Award className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Comprehensive KPIs including trip completion, on-time delivery, safety, and customer satisfaction.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Trip completion and on-time percentage</div>
            <div>• Safety score and incident tracking</div>
            <div>• Revenue generation per trip/km</div>
            <div>• Fuel efficiency and cost metrics</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Recognition & Rewards</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Track driver awards, achievements, and penalties to motivate performance and recognize excellence.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Driver of the Month/Quarter/Year</div>
            <div>• Safety excellence awards</div>
            <div>• Fuel efficiency champions</div>
            <div>• Customer satisfaction awards</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Performance Improvement</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Identify strengths and areas for improvement with actionable recommendations for each driver.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Personalized improvement plans</div>
            <div>• Training recommendations</div>
            <div>• Performance coaching</div>
            <div>• Probation monitoring</div>
          </div>
        </div>
      </div>
    </div>
  );
}
