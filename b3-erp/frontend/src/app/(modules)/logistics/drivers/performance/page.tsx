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
    {
      id: 2,
      driverId: 'DRV-002',
      driverName: 'Suresh Kumar',
      vehicleNumber: 'KA-05-CD-5678',
      vehicleType: '20-Ft Container',
      employmentDate: '2021-05-10',
      totalExperience: 8,
      period: 'Last 6 Months',
      totalTrips: 220,
      completedTrips: 218,
      cancelledTrips: 2,
      completionRate: 99.1,
      totalDistance: 98500,
      avgTripDistance: 452,
      onTimeDeliveries: 205,
      lateDeliveries: 13,
      onTimePercentage: 94.0,
      avgDelay: 18,
      totalRevenue: 5910000,
      revenuePerTrip: 27136,
      revenuePerKm: 60,
      fuelEfficiency: 4.0,
      avgFuelConsumption: 113,
      fuelCostPerKm: 23.5,
      safetyScore: 92,
      accidentsCount: 0,
      violationsCount: 2,
      incidentsCount: 3,
      customerRating: 4.5,
      customerComplaints: 5,
      customerCompliments: 18,
      utilizationRate: 73.3,
      averageSpeed: 58,
      idleTime: 96,
      restCompliance: 95,
      maintenanceAlerts: 5,
      performanceRating: 'good',
      performanceScore: 85,
      strengths: [
        'High trip completion rate',
        'Good safety record',
        'Reliable short-haul performance'
      ],
      improvements: [
        'Improve on-time delivery rate',
        'Reduce idle time',
        'Better fuel efficiency management'
      ],
      awards: [],
      penalties: [
        'Minor speeding violation - July 2024'
      ],
      status: 'active'
    },
    {
      id: 3,
      driverId: 'DRV-003',
      driverName: 'Mohan Das',
      vehicleNumber: 'WB-02-EF-9012',
      vehicleType: '40-Ft Truck',
      employmentDate: '2021-08-20',
      totalExperience: 15,
      period: 'Last 6 Months',
      totalTrips: 125,
      completedTrips: 123,
      cancelledTrips: 2,
      completionRate: 98.4,
      totalDistance: 265800,
      avgTripDistance: 2161,
      onTimeDeliveries: 115,
      lateDeliveries: 8,
      onTimePercentage: 93.5,
      avgDelay: 25,
      totalRevenue: 15948000,
      revenuePerTrip: 129660,
      revenuePerKm: 60,
      fuelEfficiency: 5.0,
      avgFuelConsumption: 432,
      fuelCostPerKm: 19.0,
      safetyScore: 94,
      accidentsCount: 0,
      violationsCount: 1,
      incidentsCount: 2,
      customerRating: 4.7,
      customerComplaints: 3,
      customerCompliments: 22,
      utilizationRate: 80.0,
      averageSpeed: 60,
      idleTime: 72,
      restCompliance: 97,
      maintenanceAlerts: 4,
      performanceRating: 'excellent',
      performanceScore: 92,
      strengths: [
        'Long-haul expertise',
        'Excellent revenue generation',
        'Strong safety record',
        'High utilization rate'
      ],
      improvements: [
        'Improve on-time delivery percentage',
        'Reduce average delay time'
      ],
      awards: [
        'Long-Haul Excellence Award 2024'
      ],
      penalties: [],
      status: 'active'
    },
    {
      id: 4,
      driverId: 'DRV-004',
      driverName: 'Prakash Reddy',
      vehicleNumber: 'TS-09-GH-3456',
      vehicleType: '24-Ft Truck',
      employmentDate: '2024-09-01',
      totalExperience: 5,
      period: 'Last 3 Months',
      totalTrips: 45,
      completedTrips: 42,
      cancelledTrips: 3,
      completionRate: 93.3,
      totalDistance: 29250,
      avgTripDistance: 696,
      onTimeDeliveries: 35,
      lateDeliveries: 7,
      onTimePercentage: 83.3,
      avgDelay: 38,
      totalRevenue: 1755000,
      revenuePerTrip: 41786,
      revenuePerKm: 60,
      fuelEfficiency: 4.5,
      avgFuelConsumption: 155,
      fuelCostPerKm: 21.0,
      safetyScore: 78,
      accidentsCount: 1,
      violationsCount: 4,
      incidentsCount: 3,
      customerRating: 3.9,
      customerComplaints: 8,
      customerCompliments: 5,
      utilizationRate: 60.0,
      averageSpeed: 55,
      idleTime: 120,
      restCompliance: 88,
      maintenanceAlerts: 7,
      performanceRating: 'average',
      performanceScore: 68,
      strengths: [
        'Willing to learn',
        'Accepts feedback positively'
      ],
      improvements: [
        'CRITICAL: Improve safety score and reduce violations',
        'Better time management for on-time deliveries',
        'Reduce customer complaints',
        'Improve rest compliance',
        'Better fuel efficiency practices'
      ],
      awards: [],
      penalties: [
        'Traffic violation - Sep 2024',
        'Customer complaint - Oct 2024',
        'Minor accident - Oct 2024'
      ],
      status: 'probation'
    },
    {
      id: 5,
      driverId: 'DRV-005',
      driverName: 'Ganesh Patil',
      vehicleNumber: 'MH-12-IJ-7890',
      vehicleType: '18-Ft Truck',
      employmentDate: '2022-02-01',
      totalExperience: 10,
      period: 'Last 6 Months',
      totalTrips: 180,
      completedTrips: 180,
      cancelledTrips: 0,
      completionRate: 100.0,
      totalDistance: 76500,
      avgTripDistance: 425,
      onTimeDeliveries: 175,
      lateDeliveries: 5,
      onTimePercentage: 97.2,
      avgDelay: 8,
      totalRevenue: 4590000,
      revenuePerTrip: 25500,
      revenuePerKm: 60,
      fuelEfficiency: 6.8,
      avgFuelConsumption: 62,
      fuelCostPerKm: 14.0,
      safetyScore: 98,
      accidentsCount: 0,
      violationsCount: 0,
      incidentsCount: 1,
      customerRating: 4.9,
      customerComplaints: 1,
      customerCompliments: 35,
      utilizationRate: 93.3,
      averageSpeed: 65,
      idleTime: 24,
      restCompliance: 99,
      maintenanceAlerts: 2,
      performanceRating: 'excellent',
      performanceScore: 98,
      strengths: [
        'Perfect trip completion rate',
        'Outstanding safety record',
        'Excellent fuel efficiency',
        'Highest customer satisfaction',
        'Best utilization rate in fleet',
        'Minimal idle time'
      ],
      improvements: [],
      awards: [
        'Driver of the Year 2024',
        'Perfect Safety Record Award',
        'Fuel Efficiency Champion Q3 2024',
        'Customer Favorite Award'
      ],
      penalties: [],
      status: 'active'
    },
    {
      id: 6,
      driverId: 'DRV-006',
      driverName: 'Vijay Singh',
      vehicleNumber: 'DL-03-KL-2468',
      vehicleType: '28-Ft Truck',
      employmentDate: '2021-09-15',
      totalExperience: 11,
      period: 'Last 6 Months',
      totalTrips: 135,
      completedTrips: 133,
      cancelledTrips: 2,
      completionRate: 98.5,
      totalDistance: 110700,
      avgTripDistance: 832,
      onTimeDeliveries: 125,
      lateDeliveries: 8,
      onTimePercentage: 94.0,
      avgDelay: 15,
      totalRevenue: 6642000,
      revenuePerTrip: 49940,
      revenuePerKm: 60,
      fuelEfficiency: 5.5,
      avgFuelConsumption: 151,
      fuelCostPerKm: 17.3,
      safetyScore: 90,
      accidentsCount: 0,
      violationsCount: 2,
      incidentsCount: 3,
      customerRating: 4.6,
      customerComplaints: 4,
      customerCompliments: 20,
      utilizationRate: 83.3,
      averageSpeed: 64,
      idleTime: 60,
      restCompliance: 96,
      maintenanceAlerts: 4,
      performanceRating: 'good',
      performanceScore: 88,
      strengths: [
        'Good night shift performance',
        'Reliable and consistent',
        'Good fuel efficiency',
        'High completion rate'
      ],
      improvements: [
        'Improve safety score',
        'Reduce traffic violations',
        'Better on-time delivery rate'
      ],
      awards: [
        'Night Shift Excellence Award 2024'
      ],
      penalties: [
        'Minor speeding violation - Aug 2024'
      ],
      status: 'active'
    },
    {
      id: 7,
      driverId: 'DRV-007',
      driverName: 'Murugan Subramanian',
      vehicleNumber: 'TN-01-MN-1357',
      vehicleType: '32-Ft Truck',
      employmentDate: '2021-04-30',
      totalExperience: 9,
      period: 'Last 6 Months',
      totalTrips: 98,
      completedTrips: 96,
      cancelledTrips: 2,
      completionRate: 98.0,
      totalDistance: 84900,
      avgTripDistance: 884,
      onTimeDeliveries: 88,
      lateDeliveries: 8,
      onTimePercentage: 91.7,
      avgDelay: 22,
      totalRevenue: 5094000,
      revenuePerTrip: 53062,
      revenuePerKm: 60,
      fuelEfficiency: 5.0,
      avgFuelConsumption: 177,
      fuelCostPerKm: 19.0,
      safetyScore: 86,
      accidentsCount: 1,
      violationsCount: 3,
      incidentsCount: 4,
      customerRating: 4.3,
      customerComplaints: 6,
      customerCompliments: 15,
      utilizationRate: 66.7,
      averageSpeed: 59,
      idleTime: 144,
      restCompliance: 92,
      maintenanceAlerts: 6,
      performanceRating: 'average',
      performanceScore: 75,
      strengths: [
        'Port operations expertise',
        'Good trip completion rate'
      ],
      improvements: [
        'Improve safety score and reduce violations',
        'Better on-time delivery performance',
        'Reduce idle time significantly',
        'Improve customer satisfaction',
        'Better rest compliance'
      ],
      awards: [],
      penalties: [
        'Minor accident - June 2024',
        'Customer complaint - July 2024'
      ],
      status: 'active'
    },
    {
      id: 8,
      driverId: 'DRV-008',
      driverName: 'Bharat Patel',
      vehicleNumber: 'GJ-01-OP-2580',
      vehicleType: '20-Ft Truck',
      employmentDate: '2024-10-01',
      totalExperience: 4,
      period: 'Last 1 Month',
      totalTrips: 28,
      completedTrips: 26,
      cancelledTrips: 2,
      completionRate: 92.9,
      totalDistance: 14980,
      avgTripDistance: 576,
      onTimeDeliveries: 20,
      lateDeliveries: 6,
      onTimePercentage: 76.9,
      avgDelay: 45,
      totalRevenue: 898800,
      revenuePerTrip: 34569,
      revenuePerKm: 60,
      fuelEfficiency: 4.2,
      avgFuelConsumption: 137,
      fuelCostPerKm: 22.5,
      safetyScore: 72,
      accidentsCount: 0,
      violationsCount: 5,
      incidentsCount: 2,
      customerRating: 3.7,
      customerComplaints: 7,
      customerCompliments: 3,
      utilizationRate: 50.0,
      averageSpeed: 52,
      idleTime: 96,
      restCompliance: 85,
      maintenanceAlerts: 5,
      performanceRating: 'poor',
      performanceScore: 62,
      strengths: [
        'Improving gradually',
        'Responsive to training'
      ],
      improvements: [
        'URGENT: Improve safety score - below acceptable threshold',
        'Reduce traffic violations significantly',
        'Better time management - too many late deliveries',
        'Improve customer service and reduce complaints',
        'Better fuel efficiency practices',
        'Improve rest compliance'
      ],
      awards: [],
      penalties: [
        'Multiple traffic violations - Oct 2024',
        'Customer complaints - Oct 2024',
        'Poor performance warning issued'
      ],
      status: 'probation'
    }
  ]);

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
