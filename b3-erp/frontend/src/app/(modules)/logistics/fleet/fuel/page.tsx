'use client';

import React, { useState, useEffect } from 'react';
import {
  Fuel,
  Plus,
  Edit2,
  Eye,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Truck,
  MapPin,
  FileText,
  AlertCircle
} from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';

interface FuelRecord {
  id: number;
  fuelId: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  driverName: string;
  fuelType: 'diesel' | 'petrol' | 'cng' | 'electric';
  quantity: number; // liters or kWh
  unitPrice: number; // per liter or kWh
  totalCost: number;
  fuelStation: string;
  location: string;
  odometer: number; // km
  previousOdometer: number; // km
  distanceCovered: number; // km
  fuelEfficiency: number; // km/liter or km/kWh
  fillType: 'full-tank' | 'partial' | 'top-up';
  paymentMethod: 'cash' | 'card' | 'fuel-card' | 'credit';
  invoiceNumber: string;
  filledBy: string;
  filledDate: string;
  filledTime: string;
  tripId: string | null;
  notes: string;
  status: 'verified' | 'pending' | 'disputed' | 'approved';
  verifiedBy: string | null;
  expectedEfficiency: number; // km/liter
  efficiencyVariance: number; // percentage
  anomalyDetected: boolean;
}

export default function FleetFuelPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedFuelType, setSelectedFuelType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await LogisticsService.getFuelRecords()) as any[];
        const list = Array.isArray(raw) ? raw : [];
        const mapped: FuelRecord[] = list.map((r, idx) => ({
          id: idx + 1,
          fuelId: r?.fuelId ?? '',
          vehicleId: r?.vehicleId ?? '',
          vehicleNumber: r?.vehicleNumber ?? '',
          vehicleType: r?.vehicleType ?? '',
          driverName: r?.driverName ?? '',
          fuelType: (r?.fuelType ?? 'diesel') as FuelRecord['fuelType'],
          quantity: Number(r?.quantity ?? 0),
          unitPrice: Number(r?.unitPrice ?? 0),
          totalCost: Number(r?.totalCost ?? 0),
          fuelStation: r?.fuelStation ?? '',
          location: r?.location ?? '',
          odometer: Number(r?.odometer ?? 0),
          previousOdometer: Number(r?.previousOdometer ?? 0),
          distanceCovered: Number(r?.distanceCovered ?? 0),
          fuelEfficiency: Number(r?.fuelEfficiency ?? 0),
          fillType: (r?.fillType ?? 'full-tank') as FuelRecord['fillType'],
          paymentMethod: (r?.paymentMethod ?? 'fuel-card') as FuelRecord['paymentMethod'],
          invoiceNumber: r?.invoiceNumber ?? '',
          filledBy: r?.filledBy ?? '',
          filledDate: r?.filledDate ?? '',
          filledTime: r?.filledTime ?? '',
          tripId: r?.tripId ?? null,
          notes: r?.notes ?? '',
          status: (r?.status ?? 'pending') as FuelRecord['status'],
          verifiedBy: r?.verifiedBy ?? null,
          expectedEfficiency: Number(r?.expectedEfficiency ?? 0),
          efficiencyVariance: Number(r?.efficiencyVariance ?? 0),
          anomalyDetected: !!r?.anomalyDetected,
        }));
        if (!cancelled) setFuelRecords(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load fuel records');
          setFuelRecords([]);
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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'verified': 'text-green-600 bg-green-50 border-green-200',
      'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'disputed': 'text-red-600 bg-red-50 border-red-200',
      'approved': 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getFillTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'full-tank': 'text-green-600 bg-green-50',
      'partial': 'text-blue-600 bg-blue-50',
      'top-up': 'text-purple-600 bg-purple-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const getEfficiencyColor = (variance: number) => {
    if (variance >= 0) return 'text-green-600';
    if (variance >= -10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalFuelRecords = fuelRecords.length;
  const totalFuelConsumed = fuelRecords.reduce((sum, r) => sum + r.quantity, 0);
  const totalFuelCost = fuelRecords.reduce((sum, r) => sum + r.totalCost, 0);
  const totalDistance = fuelRecords.reduce((sum, r) => sum + r.distanceCovered, 0);
  const avgEfficiency = totalDistance / totalFuelConsumed;
  const anomalies = fuelRecords.filter(r => r.anomalyDetected).length;

  const filteredRecords = fuelRecords.filter(record => {
    const matchesSearch = record.fuelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVehicle = selectedVehicle === 'all' || record.vehicleNumber === selectedVehicle;
    const matchesFuelType = selectedFuelType === 'all' || record.fuelType === selectedFuelType;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesVehicle && matchesFuelType && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Fuel className="w-8 h-8 text-green-600" />
            <span>Fleet Fuel Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Track fuel consumption, costs, and efficiency</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Fuel Record</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading fuel records…
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
            <Fuel className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{totalFuelConsumed.toFixed(0)}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Total Fuel (Liters)</div>
          <div className="text-xs text-green-600 mt-1">Across {totalFuelRecords} records</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">₹{(totalFuelCost / 1000).toFixed(0)}K</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Fuel Cost</div>
          <div className="text-xs text-blue-600 mt-1">₹{totalFuelCost.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{avgEfficiency.toFixed(1)}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Avg Efficiency</div>
          <div className="text-xs text-purple-600 mt-1">km/liter</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{anomalies}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Anomalies</div>
          <div className="text-xs text-orange-600 mt-1">Requires Review</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fuel records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Vehicles</option>
            {Array.from(new Set(fuelRecords.map(r => r.vehicleNumber))).map(vehicle => (
              <option key={vehicle} value={vehicle}>{vehicle}</option>
            ))}
          </select>

          <select
            value={selectedFuelType}
            onChange={(e) => setSelectedFuelType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Fuel Types</option>
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
            <option value="cng">CNG</option>
            <option value="electric">Electric</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="disputed">Disputed</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Fuel Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location & Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className={`hover:bg-gray-50 ${record.anomalyDetected ? 'bg-red-50' : ''}`}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{record.fuelId}</div>
                    <div className="text-xs text-gray-500">{record.invoiceNumber}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{record.vehicleNumber}</div>
                    <div className="text-sm text-gray-600">{record.vehicleType}</div>
                    <div className="text-xs text-gray-500">ODO: {record.odometer.toLocaleString()} km</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.driverName}</div>
                    {record.tripId && (
                      <div className="text-xs text-blue-600">{record.tripId}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {record.quantity.toFixed(1)} L {record.fuelType.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-600">
                      ₹{record.unitPrice.toFixed(2)}/L
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFillTypeColor(record.fillType)}`}>
                      {record.fillType.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      <span>{record.location}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{record.fuelStation}</div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(record.filledDate).toLocaleDateString()} {record.filledTime}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="text-lg font-bold text-gray-900">{record.distanceCovered}</div>
                    <div className="text-xs text-gray-500">km covered</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.fuelEfficiency.toFixed(1)} km/L
                    </div>
                    <div className={`flex items-center space-x-1 text-xs ${getEfficiencyColor(record.efficiencyVariance)}`}>
                      {record.efficiencyVariance >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{Math.abs(record.efficiencyVariance).toFixed(1)}%</span>
                    </div>
                    {record.anomalyDetected && (
                      <div className="flex items-center space-x-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600">Anomaly</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{record.totalCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {record.paymentMethod.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                      {record.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Document</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !loadError && filteredRecords.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-600">
              No fuel records found.
            </div>
          )}
        </div>
      </div>

      {/* Fuel Management Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Fuel className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Fuel Tracking</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Record every fuel transaction with quantity, cost, and odometer readings for accurate consumption tracking.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Fuel quantity and unit price tracking</div>
            <div>• Odometer reading verification</div>
            <div>• Invoice and payment method recording</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Efficiency Analysis</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Calculate fuel efficiency (km/liter) and compare against expected values to identify performance issues.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Automatic efficiency calculation</div>
            <div>• Variance from expected efficiency</div>
            <div>• Efficiency trend analysis</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Anomaly Detection</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Automatically detect unusual fuel consumption patterns and efficiency deviations for investigation.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Significant efficiency variance detection</div>
            <div>• Unusual consumption pattern alerts</div>
            <div>• Fuel theft prevention</div>
          </div>
        </div>
      </div>
    </div>
  );
}
