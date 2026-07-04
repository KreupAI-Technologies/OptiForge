'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Edit2,
  Eye,
  Search,
  Truck,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity,
  Percent
} from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';

interface VehicleUtilization {
  id: number;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  totalDays: number; // days in period
  activeDays: number; // days vehicle was used
  idleDays: number; // days vehicle was idle
  maintenanceDays: number; // days in maintenance
  utilizationPercentage: number; // (activeDays / totalDays) * 100
  totalTrips: number;
  totalDistance: number; // km
  avgTripDistance: number; // km
  totalRevenue: number; // ₹
  revenuePerKm: number; // ₹/km
  revenuePerDay: number; // ₹/day
  operatingCost: number; // ₹
  fuelCost: number; // ₹
  maintenanceCost: number; // ₹
  profitability: number; // revenue - operating cost
  profitMargin: number; // (profitability / revenue) * 100
  loadCapacityUtilization: number; // average load % per trip
  driverName: string;
  currentStatus: 'active' | 'idle' | 'maintenance' | 'offline';
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
  recommendations: string[];
}

export default function FleetUtilizationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPerformance, setSelectedPerformance] = useState('all');

  const [utilizationData, setUtilizationData] = useState<VehicleUtilization[]>([
    {
      id: 1,
      vehicleId: 'VEH-001',
      vehicleNumber: 'MH-01-AB-1234',
      vehicleType: '32-Ft Truck',
      make: 'Tata',
      model: 'LPT 3118',
      year: 2022,
      totalDays: 30,
      activeDays: 26,
      idleDays: 2,
      maintenanceDays: 2,
      utilizationPercentage: 86.7,
      totalTrips: 12,
      totalDistance: 18500,
      avgTripDistance: 1542,
      totalRevenue: 925000,
      revenuePerKm: 50,
      revenuePerDay: 30833,
      operatingCost: 648000,
      fuelCost: 425000,
      maintenanceCost: 85000,
      profitability: 277000,
      profitMargin: 29.9,
      loadCapacityUtilization: 88,
      driverName: 'Ramesh Sharma',
      currentStatus: 'active',
      performanceRating: 'excellent',
      recommendations: [
        'Excellent utilization - maintain current performance',
        'Consider increasing load capacity utilization to 90%+'
      ]
    },
    {
      id: 2,
      vehicleId: 'VEH-002',
      vehicleNumber: 'KA-05-CD-5678',
      vehicleType: '20-Ft Container',
      make: 'Ashok Leyland',
      model: 'Ecomet 1615',
      year: 2023,
      totalDays: 30,
      activeDays: 22,
      idleDays: 7,
      maintenanceDays: 1,
      utilizationPercentage: 73.3,
      totalTrips: 15,
      totalDistance: 6800,
      avgTripDistance: 453,
      totalRevenue: 408000,
      revenuePerKm: 60,
      revenuePerDay: 13600,
      operatingCost: 294000,
      fuelCost: 185000,
      maintenanceCost: 28000,
      profitability: 114000,
      profitMargin: 27.9,
      loadCapacityUtilization: 75,
      driverName: 'Suresh Kumar',
      currentStatus: 'idle',
      performanceRating: 'good',
      recommendations: [
        'Good utilization but can be improved',
        'Reduce idle days - schedule more short-haul trips',
        'Improve load capacity utilization to 85%+'
      ]
    },
    {
      id: 3,
      vehicleId: 'VEH-003',
      vehicleNumber: 'WB-02-EF-9012',
      vehicleType: '40-Ft Truck',
      make: 'Mahindra',
      model: 'Blazo X 42',
      year: 2021,
      totalDays: 30,
      activeDays: 24,
      idleDays: 3,
      maintenanceDays: 3,
      utilizationPercentage: 80.0,
      totalTrips: 8,
      totalDistance: 16800,
      avgTripDistance: 2100,
      totalRevenue: 1008000,
      revenuePerKm: 60,
      revenuePerDay: 33600,
      operatingCost: 728000,
      fuelCost: 485000,
      maintenanceCost: 125000,
      profitability: 280000,
      profitMargin: 27.8,
      loadCapacityUtilization: 92,
      driverName: 'Mohan Das',
      currentStatus: 'active',
      performanceRating: 'excellent',
      recommendations: [
        'Excellent load capacity utilization',
        'Good overall performance',
        'Consider reducing maintenance downtime'
      ]
    },
    {
      id: 4,
      vehicleId: 'VEH-004',
      vehicleNumber: 'TS-09-GH-3456',
      vehicleType: '24-Ft Truck',
      make: 'BharatBenz',
      model: '2826R',
      year: 2023,
      totalDays: 30,
      activeDays: 18,
      idleDays: 5,
      maintenanceDays: 7,
      utilizationPercentage: 60.0,
      totalTrips: 10,
      totalDistance: 6500,
      avgTripDistance: 650,
      totalRevenue: 390000,
      revenuePerKm: 60,
      revenuePerDay: 13000,
      operatingCost: 312000,
      fuelCost: 195000,
      maintenanceCost: 88000,
      profitability: 78000,
      profitMargin: 20.0,
      loadCapacityUtilization: 82,
      driverName: 'Prakash Reddy',
      currentStatus: 'maintenance',
      performanceRating: 'average',
      recommendations: [
        'High maintenance days affecting utilization',
        'Review maintenance schedule - plan preventive maintenance better',
        'Reduce idle days when vehicle is operational',
        'Profit margin below target - optimize operating costs'
      ]
    },
    {
      id: 5,
      vehicleId: 'VEH-005',
      vehicleNumber: 'MH-12-IJ-7890',
      vehicleType: '18-Ft Truck',
      make: 'Eicher',
      model: 'Pro 6025T',
      year: 2022,
      totalDays: 30,
      activeDays: 28,
      idleDays: 1,
      maintenanceDays: 1,
      utilizationPercentage: 93.3,
      totalTrips: 20,
      totalDistance: 8500,
      avgTripDistance: 425,
      totalRevenue: 510000,
      revenuePerKm: 60,
      revenuePerDay: 17000,
      operatingCost: 340000,
      fuelCost: 210000,
      maintenanceCost: 32000,
      profitability: 170000,
      profitMargin: 33.3,
      loadCapacityUtilization: 68,
      driverName: 'Ganesh Patil',
      currentStatus: 'active',
      performanceRating: 'excellent',
      recommendations: [
        'Outstanding utilization rate - best in fleet',
        'Excellent profit margin',
        'Consider increasing load capacity per trip to maximize revenue'
      ]
    },
    {
      id: 6,
      vehicleId: 'VEH-006',
      vehicleNumber: 'DL-03-KL-2468',
      vehicleType: '28-Ft Truck',
      make: 'Tata',
      model: 'Signa 2823.K',
      year: 2021,
      totalDays: 30,
      activeDays: 25,
      idleDays: 3,
      maintenanceDays: 2,
      utilizationPercentage: 83.3,
      totalTrips: 11,
      totalDistance: 8200,
      avgTripDistance: 745,
      totalRevenue: 492000,
      revenuePerKm: 60,
      revenuePerDay: 16400,
      operatingCost: 369000,
      fuelCost: 246000,
      maintenanceCost: 55000,
      profitability: 123000,
      profitMargin: 25.0,
      loadCapacityUtilization: 85,
      driverName: 'Vijay Singh',
      currentStatus: 'active',
      performanceRating: 'good',
      recommendations: [
        'Good utilization and performance',
        'Improve profit margin by optimizing fuel consumption',
        'Maintain current load capacity utilization'
      ]
    },
    {
      id: 7,
      vehicleId: 'VEH-007',
      vehicleNumber: 'TN-01-MN-1357',
      vehicleType: '32-Ft Truck',
      make: 'Volvo',
      model: 'FH16',
      year: 2023,
      totalDays: 30,
      activeDays: 20,
      idleDays: 9,
      maintenanceDays: 1,
      utilizationPercentage: 66.7,
      totalTrips: 9,
      totalDistance: 7800,
      avgTripDistance: 867,
      totalRevenue: 468000,
      revenuePerKm: 60,
      revenuePerDay: 15600,
      operatingCost: 351000,
      fuelCost: 234000,
      maintenanceCost: 30000,
      profitability: 117000,
      profitMargin: 25.0,
      loadCapacityUtilization: 78,
      driverName: 'Murugan Subramanian',
      currentStatus: 'idle',
      performanceRating: 'average',
      recommendations: [
        'High idle days reducing overall utilization',
        'Schedule more trips to improve utilization to 80%+',
        'Improve load capacity utilization',
        'Consider assigning to longer routes for better revenue'
      ]
    },
    {
      id: 8,
      vehicleId: 'VEH-008',
      vehicleNumber: 'GJ-01-OP-2580',
      vehicleType: '20-Ft Truck',
      make: 'Ashok Leyland',
      model: 'Partner',
      year: 2020,
      totalDays: 30,
      activeDays: 15,
      idleDays: 12,
      maintenanceDays: 3,
      utilizationPercentage: 50.0,
      totalTrips: 8,
      totalDistance: 4500,
      avgTripDistance: 563,
      totalRevenue: 270000,
      revenuePerKm: 60,
      revenuePerDay: 9000,
      operatingCost: 234000,
      fuelCost: 153000,
      maintenanceCost: 42000,
      profitability: 36000,
      profitMargin: 13.3,
      loadCapacityUtilization: 62,
      driverName: 'Bharat Patel',
      currentStatus: 'offline',
      performanceRating: 'poor',
      recommendations: [
        'CRITICAL: Low utilization - only 50% of available days',
        'Very high idle days - investigate scheduling issues',
        'Poor profit margin - below 15% threshold',
        'Consider fleet optimization or reassignment',
        'Improve load capacity utilization significantly',
        'Review if vehicle should remain in active fleet'
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'text-green-600 bg-green-50 border-green-200',
      'idle': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'maintenance': 'text-orange-600 bg-orange-50 border-orange-200',
      'offline': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPerformanceColor = (rating: string) => {
    const colors: { [key: string]: string } = {
      'excellent': 'text-green-600 bg-green-50 border-green-200',
      'good': 'text-blue-600 bg-blue-50 border-blue-200',
      'average': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'poor': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[rating] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 25) return 'text-green-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalVehicles = utilizationData.length;
  const avgUtilization = utilizationData.reduce((sum, v) => sum + v.utilizationPercentage, 0) / totalVehicles;
  const totalRevenue = utilizationData.reduce((sum, v) => sum + v.totalRevenue, 0);
  const totalProfitability = utilizationData.reduce((sum, v) => sum + v.profitability, 0);
  const avgProfitMargin = (totalProfitability / totalRevenue) * 100;

  const filteredData = utilizationData.filter(vehicle => {
    const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.driverName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || vehicle.currentStatus === selectedStatus;
    const matchesType = selectedType === 'all' || vehicle.vehicleType === selectedType;
    const matchesPerformance = selectedPerformance === 'all' || vehicle.performanceRating === selectedPerformance;
    return matchesSearch && matchesStatus && matchesType && matchesPerformance;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span>Fleet Utilization</span>
          </h1>
          <p className="text-gray-600 mt-1">Analyze vehicle utilization, revenue, and profitability</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{avgUtilization.toFixed(1)}%</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Avg Utilization</div>
          <div className="text-xs text-purple-600 mt-1">Fleet Average</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">₹{(totalRevenue / 1000000).toFixed(1)}M</span>
          </div>
          <div className="text-sm font-medium text-green-700">Total Revenue</div>
          <div className="text-xs text-green-600 mt-1">₹{totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">₹{(totalProfitability / 1000000).toFixed(1)}M</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Profit</div>
          <div className="text-xs text-blue-600 mt-1">₹{totalProfitability.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{avgProfitMargin.toFixed(1)}%</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Avg Profit Margin</div>
          <div className="text-xs text-orange-600 mt-1">Fleet Average</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Vehicle Types</option>
            <option value="18-Ft Truck">18-Ft Truck</option>
            <option value="20-Ft Container">20-Ft Container</option>
            <option value="24-Ft Truck">24-Ft Truck</option>
            <option value="28-Ft Truck">28-Ft Truck</option>
            <option value="32-Ft Truck">32-Ft Truck</option>
            <option value="40-Ft Truck">40-Ft Truck</option>
          </select>

          <select
            value={selectedPerformance}
            onChange={(e) => setSelectedPerformance(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Performance</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="poor">Poor</option>
          </select>
        </div>
      </div>

      {/* Utilization Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Breakdown</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips & Distance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costs</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profitability</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                    <div className="text-sm text-gray-600">{vehicle.vehicleType}</div>
                    <div className="text-xs text-gray-500 mt-1">{vehicle.make} {vehicle.model}</div>
                    <div className="text-xs text-gray-500">{vehicle.driverName}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className={`text-2xl font-bold ${getUtilizationColor(vehicle.utilizationPercentage)}`}>
                      {vehicle.utilizationPercentage.toFixed(1)}%
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-24 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          vehicle.utilizationPercentage >= 80 ? 'bg-green-500' :
                          vehicle.utilizationPercentage >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${vehicle.utilizationPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Load: {vehicle.loadCapacityUtilization}%</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-green-600">Active: {vehicle.activeDays} days</div>
                    <div className="text-sm text-yellow-600">Idle: {vehicle.idleDays} days</div>
                    <div className="text-sm text-orange-600">Maintenance: {vehicle.maintenanceDays} days</div>
                    <div className="text-xs text-gray-500 mt-1">Total: {vehicle.totalDays} days</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vehicle.totalTrips} trips</div>
                    <div className="text-sm text-gray-600">{vehicle.totalDistance.toLocaleString()} km</div>
                    <div className="text-xs text-gray-500 mt-1">Avg: {vehicle.avgTripDistance} km/trip</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">₹{vehicle.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">₹{vehicle.revenuePerKm}/km</div>
                    <div className="text-xs text-gray-600">₹{vehicle.revenuePerDay}/day</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{vehicle.operatingCost.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Fuel: ₹{vehicle.fuelCost.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Maint: ₹{vehicle.maintenanceCost.toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">₹{vehicle.profitability.toLocaleString()}</div>
                    <div className={`text-sm font-medium ${getProfitMarginColor(vehicle.profitMargin)}`}>
                      {vehicle.profitMargin.toFixed(1)}% margin
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(vehicle.performanceRating)}`}>
                      {vehicle.performanceRating.toUpperCase()}
                    </span>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(vehicle.currentStatus)}`}>
                        {vehicle.currentStatus.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <BarChart3 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Analytics</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Utilization Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Utilization Analysis</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Track vehicle utilization percentage based on active days, idle days, and maintenance downtime.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Target: 80%+ utilization</div>
            <div>• Active days vs total available days</div>
            <div>• Load capacity utilization per trip</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Revenue & Profitability</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Monitor revenue per kilometer, operating costs, and profit margins for each vehicle.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Revenue per km and per day</div>
            <div>• Operating cost breakdown</div>
            <div>• Target: 25%+ profit margin</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Performance Recommendations</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Get actionable recommendations to improve utilization, reduce idle time, and increase profitability.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Reduce idle and maintenance days</div>
            <div>• Improve load capacity utilization</div>
            <div>• Optimize route assignments</div>
          </div>
        </div>
      </div>
    </div>
  );
}
