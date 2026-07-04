'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Plus,
  Edit2,
  Eye,
  Search,
  Truck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Phone,
  FileText
} from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';

interface DriverAssignment {
  id: number;
  assignmentId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  assignmentType: 'permanent' | 'temporary' | 'relief' | 'shared';
  assignmentDate: string;
  validFrom: string;
  validUntil: string | null;
  currentTrip: string | null;
  currentLoad: string | null;
  currentLocation: string;
  tripStatus: 'available' | 'on-trip' | 'resting' | 'on-leave' | 'inactive';
  totalTripsAssigned: number;
  completedTrips: number;
  activeTrips: number;
  totalDistance: number; // km
  totalRevenue: number; // ₹
  shiftType: 'day' | 'night' | 'rotating' | 'flexible';
  workingHours: number; // hours per week
  restHours: number; // hours since last trip
  nextAvailableTime: string | null;
  homeBase: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
  status: 'active' | 'inactive' | 'suspended' | 'on-leave';
  assignedBy: string;
  lastModified: string;
}

export default function DriverAssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTripStatus, setSelectedTripStatus] = useState('all');
  const [selectedAssignmentType, setSelectedAssignmentType] = useState('all');

  const [assignments, setAssignments] = useState<DriverAssignment[]>([]);
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
        const mapped: DriverAssignment[] = list.map((r, idx) => ({
          id: idx + 1,
          assignmentId: r?.assignmentId ?? '',
          driverId: r?.driverId ?? '',
          driverName: r?.driverName ?? '',
          driverPhone: r?.driverPhone ?? '',
          licenseNumber: r?.licenseNumber ?? '',
          licenseExpiry: r?.licenseExpiry ?? '',
          vehicleId: r?.vehicleId ?? '',
          vehicleNumber: r?.vehicleNumber ?? '',
          vehicleType: r?.vehicleType ?? '',
          assignmentType: (r?.assignmentType ?? 'permanent') as DriverAssignment['assignmentType'],
          assignmentDate: r?.assignmentDate ?? '',
          validFrom: r?.validFrom ?? '',
          validUntil: r?.validUntil ?? null,
          currentTrip: r?.currentTrip ?? null,
          currentLoad: r?.currentLoad ?? null,
          currentLocation: r?.currentLocation ?? '',
          tripStatus: (r?.tripStatus ?? 'available') as DriverAssignment['tripStatus'],
          totalTripsAssigned: Number(r?.totalTripsAssigned ?? 0),
          completedTrips: Number(r?.completedTrips ?? 0),
          activeTrips: Number(r?.activeTrips ?? 0),
          totalDistance: Number(r?.totalDistance ?? 0),
          totalRevenue: Number(r?.totalRevenue ?? 0),
          shiftType: (r?.shiftType ?? 'day') as DriverAssignment['shiftType'],
          workingHours: Number(r?.workingHours ?? 0),
          restHours: Number(r?.restHours ?? 0),
          nextAvailableTime: r?.nextAvailableTime ?? null,
          homeBase: r?.homeBase ?? '',
          emergencyContact: r?.emergencyContact ?? '',
          emergencyPhone: r?.emergencyPhone ?? '',
          notes: r?.notes ?? '',
          status: (r?.status ?? 'active') as DriverAssignment['status'],
          assignedBy: r?.assignedBy ?? '',
          lastModified: r?.lastModified ?? '',
        }));
        if (!cancelled) setAssignments(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load drivers');
          setAssignments([]);
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
      'active': 'text-green-600 bg-green-50 border-green-200',
      'inactive': 'text-gray-600 bg-gray-50 border-gray-200',
      'suspended': 'text-red-600 bg-red-50 border-red-200',
      'on-leave': 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getTripStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'available': 'text-green-600 bg-green-50 border-green-200',
      'on-trip': 'text-blue-600 bg-blue-50 border-blue-200',
      'resting': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'on-leave': 'text-orange-600 bg-orange-50 border-orange-200',
      'inactive': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getAssignmentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'permanent': 'text-green-600 bg-green-50',
      'temporary': 'text-blue-600 bg-blue-50',
      'relief': 'text-orange-600 bg-orange-50',
      'shared': 'text-purple-600 bg-purple-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  const onTripDrivers = assignments.filter(a => a.tripStatus === 'on-trip').length;
  const availableDrivers = assignments.filter(a => a.tripStatus === 'available').length;

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.assignmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.driverId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    const matchesTripStatus = selectedTripStatus === 'all' || assignment.tripStatus === selectedTripStatus;
    const matchesAssignmentType = selectedAssignmentType === 'all' || assignment.assignmentType === selectedAssignmentType;
    return matchesSearch && matchesStatus && matchesTripStatus && matchesAssignmentType;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <User className="w-8 h-8 text-blue-600" />
            <span>Driver Assignments</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage driver-vehicle assignments and availability</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
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
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <User className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalAssignments}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Assignments</div>
          <div className="text-xs text-blue-600 mt-1">All Driver-Vehicle Pairs</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{activeAssignments}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Active Assignments</div>
          <div className="text-xs text-green-600 mt-1">Currently Operational</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{onTripDrivers}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">On Trip</div>
          <div className="text-xs text-purple-600 mt-1">Currently Driving</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{availableDrivers}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Available</div>
          <div className="text-xs text-orange-600 mt-1">Ready for Assignment</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="on-leave">On Leave</option>
          </select>

          <select
            value={selectedTripStatus}
            onChange={(e) => setSelectedTripStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Trip Status</option>
            <option value="available">Available</option>
            <option value="on-trip">On Trip</option>
            <option value="resting">Resting</option>
            <option value="on-leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={selectedAssignmentType}
            onChange={(e) => setSelectedAssignmentType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Assignment Types</option>
            <option value="permanent">Permanent</option>
            <option value="temporary">Temporary</option>
            <option value="relief">Relief</option>
            <option value="shared">Shared</option>
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Assigned</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{assignment.assignmentId}</div>
                    <div className="text-xs text-gray-500">
                      From: {new Date(assignment.validFrom).toLocaleDateString()}
                    </div>
                    {assignment.validUntil && (
                      <div className="text-xs text-orange-600">
                        Until: {new Date(assignment.validUntil).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{assignment.driverName}</div>
                    <div className="text-sm text-gray-600">{assignment.driverId}</div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{assignment.driverPhone}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      License: {assignment.licenseNumber}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{assignment.vehicleNumber}</div>
                    <div className="text-sm text-gray-600">{assignment.vehicleType}</div>
                    <div className="text-xs text-gray-500">{assignment.vehicleId}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAssignmentTypeColor(assignment.assignmentType)}`}>
                      {assignment.assignmentType.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{assignment.shiftType} shift</div>
                  </td>
                  <td className="px-3 py-2">
                    {assignment.currentTrip ? (
                      <>
                        <div className="text-sm font-medium text-blue-600">{assignment.currentTrip}</div>
                        <div className="text-xs text-gray-600">Load: {assignment.currentLoad}</div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{assignment.currentLocation}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-600">No active trip</div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{assignment.currentLocation}</span>
                        </div>
                        {assignment.nextAvailableTime && (
                          <div className="text-xs text-blue-600 mt-1">
                            Next: {new Date(assignment.nextAvailableTime).toLocaleString()}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.totalTripsAssigned} trips</div>
                    <div className="text-xs text-green-600">✓ {assignment.completedTrips} completed</div>
                    <div className="text-xs text-gray-600">{assignment.totalDistance.toLocaleString()} km</div>
                    <div className="text-xs text-blue-600">₹{(assignment.totalRevenue / 1000).toFixed(0)}K revenue</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.workingHours}h/week</div>
                    <div className="text-xs text-gray-600">Rest: {assignment.restHours}h</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTripStatusColor(assignment.tripStatus)}`}>
                      {assignment.tripStatus.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('-', ' ').toUpperCase()}
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
        </div>
      </div>

      {/* Driver Assignment Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Assignment Types</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Manage different types of driver-vehicle assignments based on operational needs.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Permanent: Long-term fixed assignments</div>
            <div>• Temporary: Short-term contract assignments</div>
            <div>• Relief: Backup driver assignments</div>
            <div>• Shared: Multiple drivers per vehicle</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Performance Tracking</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Track driver performance with trip counts, distance covered, and revenue generated.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Total trips assigned and completed</div>
            <div>• Distance covered and revenue</div>
            <div>• Working hours and rest periods</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Availability Management</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Monitor driver availability, rest hours, and next available time for trip assignments.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Real-time availability status</div>
            <div>• Rest hour compliance tracking</div>
            <div>• Next available time prediction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
