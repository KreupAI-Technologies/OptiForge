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
    {
      id: 2,
      assignmentId: 'DA-2024-002',
      driverId: 'DRV-002',
      driverName: 'Suresh Kumar',
      driverPhone: '+91-9876543212',
      licenseNumber: 'KA-0520220034567',
      licenseExpiry: '2026-12-15',
      vehicleId: 'VEH-002',
      vehicleNumber: 'KA-05-CD-5678',
      vehicleType: '20-Ft Container',
      assignmentType: 'permanent',
      assignmentDate: '2023-05-10',
      validFrom: '2023-05-10',
      validUntil: null,
      currentTrip: null,
      currentLoad: null,
      currentLocation: 'Bangalore Plant, Karnataka',
      tripStatus: 'available',
      totalTripsAssigned: 220,
      completedTrips: 220,
      activeTrips: 0,
      totalDistance: 98500,
      totalRevenue: 5910000,
      shiftType: 'flexible',
      workingHours: 40,
      restHours: 24,
      nextAvailableTime: '2024-10-22 06:00',
      homeBase: 'Bangalore Plant',
      emergencyContact: 'Lakshmi Kumar (Wife)',
      emergencyPhone: '+91-9876543213',
      notes: 'Preferred for short-haul routes',
      status: 'active',
      assignedBy: 'Fleet Manager',
      lastModified: '2024-10-21 09:00'
    },
    {
      id: 3,
      assignmentId: 'DA-2024-003',
      driverId: 'DRV-003',
      driverName: 'Mohan Das',
      driverPhone: '+91-9876543214',
      licenseNumber: 'WB-0220210056789',
      licenseExpiry: '2025-08-20',
      vehicleId: 'VEH-003',
      vehicleNumber: 'WB-02-EF-9012',
      vehicleType: '40-Ft Truck',
      assignmentType: 'permanent',
      assignmentDate: '2023-08-20',
      validFrom: '2023-08-20',
      validUntil: null,
      currentTrip: 'TRP-2024-003',
      currentLoad: 'LD-2024-003',
      currentLocation: 'Bhubaneswar Hub, Odisha',
      tripStatus: 'on-trip',
      totalTripsAssigned: 125,
      completedTrips: 123,
      activeTrips: 2,
      totalDistance: 265800,
      totalRevenue: 15948000,
      shiftType: 'rotating',
      workingHours: 52,
      restHours: 8,
      nextAvailableTime: null,
      homeBase: 'Kolkata Distribution Center',
      emergencyContact: 'Radha Das (Wife)',
      emergencyPhone: '+91-9876543215',
      notes: 'Specialized in long-haul routes',
      status: 'active',
      assignedBy: 'Fleet Manager',
      lastModified: '2024-10-21 10:15'
    },
    {
      id: 4,
      assignmentId: 'DA-2024-004',
      driverId: 'DRV-004',
      driverName: 'Prakash Reddy',
      driverPhone: '+91-9876543216',
      licenseNumber: 'TS-0920220067890',
      licenseExpiry: '2026-03-10',
      vehicleId: 'VEH-004',
      vehicleNumber: 'TS-09-GH-3456',
      vehicleType: '24-Ft Truck',
      assignmentType: 'temporary',
      assignmentDate: '2024-09-01',
      validFrom: '2024-09-01',
      validUntil: '2024-12-31',
      currentTrip: null,
      currentLoad: null,
      currentLocation: 'Hyderabad Workshop, Telangana',
      tripStatus: 'resting',
      totalTripsAssigned: 45,
      completedTrips: 45,
      activeTrips: 0,
      totalDistance: 29250,
      totalRevenue: 1755000,
      shiftType: 'day',
      workingHours: 44,
      restHours: 48,
      nextAvailableTime: '2024-10-23 08:00',
      homeBase: 'Hyderabad Depot',
      emergencyContact: 'Kavitha Reddy (Wife)',
      emergencyPhone: '+91-9876543217',
      notes: 'Temporary assignment - contract ends Dec 2024',
      status: 'active',
      assignedBy: 'Operations Manager',
      lastModified: '2024-10-19 15:30'
    },
    {
      id: 5,
      assignmentId: 'DA-2024-005',
      driverId: 'DRV-005',
      driverName: 'Ganesh Patil',
      driverPhone: '+91-9876543218',
      licenseNumber: 'MH-1220230078901',
      licenseExpiry: '2028-01-25',
      vehicleId: 'VEH-005',
      vehicleNumber: 'MH-12-IJ-7890',
      vehicleType: '18-Ft Truck',
      assignmentType: 'permanent',
      assignmentDate: '2024-02-01',
      validFrom: '2024-02-01',
      validUntil: null,
      currentTrip: null,
      currentLoad: null,
      currentLocation: 'Pune Hub, Maharashtra',
      tripStatus: 'available',
      totalTripsAssigned: 180,
      completedTrips: 180,
      activeTrips: 0,
      totalDistance: 76500,
      totalRevenue: 4590000,
      shiftType: 'day',
      workingHours: 42,
      restHours: 18,
      nextAvailableTime: '2024-10-22 07:00',
      homeBase: 'Pune Hub',
      emergencyContact: 'Savita Patil (Wife)',
      emergencyPhone: '+91-9876543219',
      notes: 'Excellent for city and regional deliveries',
      status: 'active',
      assignedBy: 'Fleet Manager',
      lastModified: '2024-10-21 08:45'
    },
    {
      id: 6,
      assignmentId: 'DA-2024-006',
      driverId: 'DRV-006',
      driverName: 'Vijay Singh',
      driverPhone: '+91-9876543220',
      licenseNumber: 'DL-0320220089012',
      licenseExpiry: '2026-09-15',
      vehicleId: 'VEH-006',
      vehicleNumber: 'DL-03-KL-2468',
      vehicleType: '28-Ft Truck',
      assignmentType: 'permanent',
      assignmentDate: '2023-09-15',
      validFrom: '2023-09-15',
      validUntil: null,
      currentTrip: 'TRP-2024-006',
      currentLoad: 'LD-2024-006',
      currentLocation: 'Ambala Transit, Haryana',
      tripStatus: 'on-trip',
      totalTripsAssigned: 135,
      completedTrips: 133,
      activeTrips: 2,
      totalDistance: 110700,
      totalRevenue: 6642000,
      shiftType: 'night',
      workingHours: 46,
      restHours: 10,
      nextAvailableTime: null,
      homeBase: 'Delhi Distribution Center',
      emergencyContact: 'Geeta Singh (Wife)',
      emergencyPhone: '+91-9876543221',
      notes: 'Preferred for night shift operations',
      status: 'active',
      assignedBy: 'Fleet Manager',
      lastModified: '2024-10-21 14:00'
    },
    {
      id: 7,
      assignmentId: 'DA-2024-007',
      driverId: 'DRV-007',
      driverName: 'Murugan Subramanian',
      driverPhone: '+91-9876543222',
      licenseNumber: 'TN-0120220090123',
      licenseExpiry: '2027-04-30',
      vehicleId: 'VEH-007',
      vehicleNumber: 'TN-01-MN-1357',
      vehicleType: '32-Ft Truck',
      assignmentType: 'permanent',
      assignmentDate: '2023-04-30',
      validFrom: '2023-04-30',
      validUntil: null,
      currentTrip: null,
      currentLoad: null,
      currentLocation: 'Chennai Port, Tamil Nadu',
      tripStatus: 'resting',
      totalTripsAssigned: 98,
      completedTrips: 98,
      activeTrips: 0,
      totalDistance: 84900,
      totalRevenue: 5094000,
      shiftType: 'flexible',
      workingHours: 38,
      restHours: 36,
      nextAvailableTime: '2024-10-23 06:00',
      homeBase: 'Chennai Port',
      emergencyContact: 'Lakshmi Murugan (Wife)',
      emergencyPhone: '+91-9876543223',
      notes: 'Specialized in port operations and coastal routes',
      status: 'active',
      assignedBy: 'Fleet Manager',
      lastModified: '2024-10-20 16:30'
    },
    {
      id: 8,
      assignmentId: 'DA-2024-008',
      driverId: 'DRV-008',
      driverName: 'Bharat Patel',
      driverPhone: '+91-9876543224',
      licenseNumber: 'GJ-0120210012345',
      licenseExpiry: '2025-11-20',
      vehicleId: 'VEH-008',
      vehicleNumber: 'GJ-01-OP-2580',
      vehicleType: '20-Ft Truck',
      assignmentType: 'relief',
      assignmentDate: '2024-10-01',
      validFrom: '2024-10-01',
      validUntil: '2024-11-30',
      currentTrip: null,
      currentLoad: null,
      currentLocation: 'Ahmedabad Hub, Gujarat',
      tripStatus: 'on-leave',
      totalTripsAssigned: 28,
      completedTrips: 28,
      activeTrips: 0,
      totalDistance: 14980,
      totalRevenue: 898800,
      shiftType: 'flexible',
      workingHours: 36,
      restHours: 72,
      nextAvailableTime: '2024-10-25 08:00',
      homeBase: 'Ahmedabad Hub',
      emergencyContact: 'Meera Patel (Wife)',
      emergencyPhone: '+91-9876543225',
      notes: 'Relief driver - currently on medical leave',
      status: 'active',
      assignedBy: 'Operations Manager',
      lastModified: '2024-10-21 11:00'
    }
  ]);

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
