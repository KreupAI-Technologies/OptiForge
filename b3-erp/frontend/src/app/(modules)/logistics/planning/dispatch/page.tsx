'use client';

import React, { useState, useEffect } from 'react';
import { LogisticsService } from '@/services/logistics.service';
import {
  Send,
  Plus,
  Edit2,
  Eye,
  Search,
  Truck,
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface DispatchDetails {
  id: number;
  dispatchId: string;
  loadId: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  origin: string;
  destination: string;
  routeCode: string;
  distance: number; // in km
  estimatedTime: number; // in hours
  scheduledDeparture: string;
  actualDeparture: string | null;
  estimatedArrival: string;
  actualArrival: string | null;
  shipments: number;
  totalWeight: number; // in kg
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'scheduled' | 'departed' | 'in-transit' | 'delayed' | 'arrived' | 'cancelled';
  currentLocation: string;
  completionPercentage: number;
  dispatchedBy: string;
  remarks: string;
  fuelCost: number;
  tollCost: number;
}

export default function DispatchManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const [dispatches, setDispatches] = useState<DispatchDetails[]>([]);

  useEffect(() => {
    const loadDispatches = async () => {
      try {
        const rows = await LogisticsService.getDispatchBoard();
        const mapped: DispatchDetails[] = (rows || []).map((row: any, index: number) => ({
          id: typeof row.id === 'number' ? row.id : index + 1,
          dispatchId: row.dispatchId ?? row.dispatchNumber ?? String(row.id ?? ''),
          loadId: row.loadId ?? row.loadPlanId ?? '',
          vehicleNumber: row.vehicleNumber ?? row.vehicleId ?? '',
          driverName: row.driverName ?? row.driverId ?? '',
          driverPhone: row.driverPhone ?? '',
          origin: row.origin ?? '',
          destination: row.destination ?? '',
          routeCode: row.routeCode ?? '',
          distance: row.distance ?? 0,
          estimatedTime: row.estimatedTime ?? 0,
          scheduledDeparture: row.scheduledDeparture ?? row.dispatchDate ?? '',
          actualDeparture: row.actualDeparture ?? null,
          estimatedArrival: row.estimatedArrival ?? '',
          actualArrival: row.actualArrival ?? null,
          shipments: row.shipments ?? 0,
          totalWeight: row.totalWeight ?? 0,
          priority: row.priority ?? 'normal',
          status: row.status ?? 'scheduled',
          currentLocation: row.currentLocation ?? '',
          completionPercentage: row.completionPercentage ?? 0,
          dispatchedBy: row.dispatchedBy ?? '',
          remarks: row.remarks ?? '',
          fuelCost: row.fuelCost ?? 0,
          tollCost: row.tollCost ?? 0,
        }));
        setDispatches(mapped);
      } catch (error) {
        setDispatches([]);
      }
    };
    loadDispatches();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'scheduled': 'text-blue-600 bg-blue-50 border-blue-200',
      'departed': 'text-purple-600 bg-purple-50 border-purple-200',
      'in-transit': 'text-green-600 bg-green-50 border-green-200',
      'delayed': 'text-orange-600 bg-orange-50 border-orange-200',
      'arrived': 'text-gray-600 bg-gray-50 border-gray-200',
      'cancelled': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'urgent': 'text-red-600 bg-red-50 border-red-200',
      'high': 'text-orange-600 bg-orange-50 border-orange-200',
      'normal': 'text-blue-600 bg-blue-50 border-blue-200',
      'low': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'arrived':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const totalDispatches = dispatches.length;
  const inTransit = dispatches.filter(d => d.status === 'in-transit' || d.status === 'departed').length;
  const onTimeDeliveries = dispatches.filter(d => d.status === 'arrived' && d.actualArrival && d.actualArrival <= d.estimatedArrival).length;
  const totalArrived = dispatches.filter(d => d.status === 'arrived').length;
  const onTimePercentage = totalArrived > 0 ? ((onTimeDeliveries / totalArrived) * 100).toFixed(1) : '0';

  const filteredDispatches = dispatches.filter(dispatch => {
    const matchesSearch = dispatch.dispatchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispatch.loadId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispatch.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispatch.driverName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || dispatch.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || dispatch.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Send className="w-8 h-8 text-purple-600" />
            <span>Dispatch Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Track and manage vehicle dispatches and deliveries</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Dispatch</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Send className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{totalDispatches}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Total Dispatches</div>
          <div className="text-xs text-purple-600 mt-1">Active & Completed</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{inTransit}</span>
          </div>
          <div className="text-sm font-medium text-green-700">In Transit</div>
          <div className="text-xs text-green-600 mt-1">Currently Moving</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{onTimePercentage}%</span>
          </div>
          <div className="text-sm font-medium text-blue-700">On-Time Delivery</div>
          <div className="text-xs text-blue-600 mt-1">Performance Rate</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{dispatches.filter(d => d.status === 'delayed').length}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Delayed</div>
          <div className="text-xs text-orange-600 mt-1">Requires Attention</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dispatches..."
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
            <option value="scheduled">Scheduled</option>
            <option value="departed">Departed</option>
            <option value="in-transit">In Transit</option>
            <option value="delayed">Delayed</option>
            <option value="arrived">Arrived</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatch Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle & Driver</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Location</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDispatches.map((dispatch) => (
                <tr key={dispatch.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{dispatch.dispatchId}</div>
                    <div className="text-sm text-gray-600">Load: {dispatch.loadId}</div>
                    <div className="text-xs text-gray-500 mt-1">{dispatch.shipments} shipments • {(dispatch.totalWeight / 1000).toFixed(1)}T</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span>{dispatch.vehicleNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{dispatch.driverName}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{dispatch.driverPhone}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{dispatch.origin}</div>
                    <div className="text-sm text-gray-600">→ {dispatch.destination}</div>
                    <div className="text-xs text-gray-500 mt-1">{dispatch.routeCode} • {dispatch.distance}km</div>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex items-center space-x-1 text-gray-900">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{new Date(dispatch.scheduledDeparture).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{new Date(dispatch.scheduledDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {dispatch.actualDeparture && (
                      <div className="text-xs text-green-600 mt-1">
                        Departed: {new Date(dispatch.actualDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>{dispatch.currentLocation}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${dispatch.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-purple-900">
                        {dispatch.completionPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(dispatch.priority)}`}>
                      {dispatch.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(dispatch.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(dispatch.status)}`}>
                        {dispatch.status.replace('-', ' ').toUpperCase()}
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
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Send className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Dispatch Process</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Manage the complete dispatch lifecycle from scheduling to delivery confirmation.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Schedule dispatches with load assignments</div>
            <div>• Track real-time vehicle locations</div>
            <div>• Monitor delivery progress and ETAs</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Vehicle & Driver Tracking</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Monitor vehicle assignments, driver details, and real-time location updates.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Vehicle allocation and availability</div>
            <div>• Driver contact information</div>
            <div>• GPS tracking and route adherence</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Exception Management</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Handle delays, route deviations, and delivery exceptions proactively.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Real-time delay notifications</div>
            <div>• Route deviation alerts</div>
            <div>• Alternate route recommendations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
