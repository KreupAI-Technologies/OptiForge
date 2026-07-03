'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserCheck, Car, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface VehicleAssignment {
  id: string;
  assignmentId: string;
  vehicleNumber: string;
  vehicleName: string;
  registrationNumber: string;
  assignedTo: string;
  employeeCode: string;
  department: string;
  designation: string;
  assignmentDate: string;
  returnDate?: string;
  purpose: string;
  status: 'active' | 'returned' | 'overdue';
  odometerReadingStart: number;
  odometerReadingEnd?: number;
  location: string;
  remarks?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrAssetsService.getVehicleAssignments();
        const mapped: VehicleAssignment[] = raw.map((a) => ({
          id: String(a.id),
          assignmentId: a.assignmentId ?? '',
          vehicleNumber: a.vehicleNumber ?? '',
          vehicleName: a.vehicleName ?? '',
          registrationNumber: a.registrationNumber ?? '',
          assignedTo: a.assignedTo ?? '',
          employeeCode: a.employeeCode ?? '',
          department: a.department ?? '',
          designation: a.designation ?? '',
          assignmentDate: a.assignmentDate ?? '',
          returnDate: a.returnDate ?? undefined,
          purpose: a.purpose ?? '',
          status: (a.status ?? 'active') as VehicleAssignment['status'],
          odometerReadingStart: Number(a.odometerReadingStart ?? 0),
          odometerReadingEnd:
            a.odometerReadingEnd != null ? Number(a.odometerReadingEnd) : undefined,
          location: a.location ?? '',
          remarks: a.remarks ?? undefined,
        }));
        if (!cancelled) setAssignments(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load vehicle assignments');
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

  const filteredAssignments = assignments.filter(a => {
    if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
    if (selectedDepartment !== 'all' && a.department !== selectedDepartment) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: assignments.length,
    active: assignments.filter(a => a.status === 'active').length,
    returned: assignments.filter(a => a.status === 'returned').length,
    overdue: assignments.filter(a => a.status === 'overdue').length
  }), [assignments]);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    returned: 'bg-blue-100 text-blue-700',
    overdue: 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Assignments</h1>
        <p className="text-sm text-gray-600 mt-1">Track vehicle assignments to employees</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading vehicle assignments…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Assignments</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Returned</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.returned}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-600">Overdue</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdue}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              New Assignment
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredAssignments.map(assignment => {
          const distanceTraveled = assignment.odometerReadingEnd ? assignment.odometerReadingEnd - assignment.odometerReadingStart : null;

          return (
            <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{assignment.vehicleName}</h3>
                      <p className="text-sm text-gray-600">{assignment.registrationNumber} • {assignment.assignmentId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[assignment.status]}`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 py-4 border-y border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Assigned To</p>
                    <p className="text-sm font-semibold text-gray-900">{assignment.assignedTo}</p>
                    <p className="text-xs text-gray-600">{assignment.employeeCode} • {assignment.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Assignment Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(assignment.assignmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {assignment.returnDate && (
                      <p className="text-xs text-gray-600">
                        Returned: {new Date(assignment.returnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Purpose</p>
                <p className="text-sm text-gray-700">{assignment.purpose}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">Start Reading</p>
                  <p className="text-lg font-bold text-blue-700">{assignment.odometerReadingStart.toLocaleString('en-IN')} km</p>
                </div>
                {assignment.odometerReadingEnd && (
                  <>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 uppercase font-medium mb-1">End Reading</p>
                      <p className="text-lg font-bold text-green-700">{assignment.odometerReadingEnd.toLocaleString('en-IN')} km</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 uppercase font-medium mb-1">Distance Traveled</p>
                      <p className="text-lg font-bold text-purple-700">{distanceTraveled?.toLocaleString('en-IN')} km</p>
                    </div>
                  </>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{assignment.location}</p>
                </div>
              </div>

              {assignment.remarks && (
                <div className="bg-yellow-50 rounded-lg p-3 mb-2 border border-yellow-200">
                  <p className="text-xs text-yellow-700 uppercase font-medium mb-1">Remarks</p>
                  <p className="text-sm text-yellow-800">{assignment.remarks}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
                {assignment.status === 'active' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Return Vehicle
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
