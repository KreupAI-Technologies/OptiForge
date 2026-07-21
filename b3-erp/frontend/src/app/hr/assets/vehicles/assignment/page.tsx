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

  // New Assignment (handleAdd) persists via HrAssetsService.createVehicleAssignment.
  // Return Vehicle still updates the locally-loaded `assignments` list only,
  // pending a dedicated backend return transition.
  const [selected, setSelected] = useState<VehicleAssignment | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [returnTarget, setReturnTarget] = useState<VehicleAssignment | null>(null);
  const [addForm, setAddForm] = useState({
    vehicleName: '',
    vehicleNumber: '',
    registrationNumber: '',
    assignedTo: '',
    employeeCode: '',
    department: '',
    designation: '',
    purpose: '',
    odometerReadingStart: '',
    location: '',
  });
  const [returnForm, setReturnForm] = useState({ odometerReadingEnd: '', remarks: '' });

  const handleAdd = async () => {
    const now = Date.now();
    const odometerReadingStart = Number(addForm.odometerReadingStart) || 0;
    try {
      const a = await HrAssetsService.createVehicleAssignment({
        assignmentId: `VA-${now}`,
        vehicleNumber: addForm.vehicleNumber,
        vehicleName: addForm.vehicleName,
        registrationNumber: addForm.registrationNumber,
        assignedTo: addForm.assignedTo,
        employeeCode: addForm.employeeCode,
        department: addForm.department,
        designation: addForm.designation,
        assignmentDate: new Date().toISOString(),
        purpose: addForm.purpose,
        odometerReadingStart,
        location: addForm.location,
      });
      const created: VehicleAssignment = {
        id: String(a.id ?? now),
        assignmentId: a.assignmentId ?? `VA-${now}`,
        vehicleNumber: a.vehicleNumber ?? addForm.vehicleNumber,
        vehicleName: a.vehicleName ?? addForm.vehicleName,
        registrationNumber: a.registrationNumber ?? addForm.registrationNumber,
        assignedTo: a.assignedTo ?? addForm.assignedTo,
        employeeCode: a.employeeCode ?? addForm.employeeCode,
        department: a.department ?? addForm.department,
        designation: a.designation ?? addForm.designation,
        assignmentDate: a.assignmentDate ?? new Date().toISOString(),
        returnDate: a.returnDate ?? undefined,
        purpose: a.purpose ?? addForm.purpose,
        status: (a.status ?? 'active') as VehicleAssignment['status'],
        odometerReadingStart: Number(a.odometerReadingStart ?? odometerReadingStart),
        odometerReadingEnd: a.odometerReadingEnd != null ? Number(a.odometerReadingEnd) : undefined,
        location: a.location ?? addForm.location,
        remarks: a.remarks ?? undefined,
      };
      setAssignments(prev => [created, ...prev]);
      setShowAdd(false);
      setAddForm({
        vehicleName: '',
        vehicleNumber: '',
        registrationNumber: '',
        assignedTo: '',
        employeeCode: '',
        department: '',
        designation: '',
        purpose: '',
        odometerReadingStart: '',
        location: '',
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleReturn = () => {
    if (!returnTarget) return;
    const targetId = returnTarget.id;
    setAssignments(prev =>
      prev.map(a =>
        a.id === targetId
          ? {
              ...a,
              status: 'returned',
              returnDate: new Date().toISOString(),
              odometerReadingEnd: Number(returnForm.odometerReadingEnd) || 0,
              remarks: returnForm.remarks || a.remarks,
            }
          : a
      )
    );
    setReturnTarget(null);
    setReturnForm({ odometerReadingEnd: '', remarks: '' });
  };

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
            <button onClick={() => setShowAdd(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
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
                <button onClick={() => setSelected(assignment)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
                {assignment.status === 'active' && (
                  <button onClick={() => setReturnTarget(assignment)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Return Vehicle
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View Details modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Assignment Details</h2>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[selected.status]}`}>
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500 uppercase font-medium">Vehicle Name</p><p className="text-gray-900">{selected.vehicleName}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Registration Number</p><p className="text-gray-900">{selected.registrationNumber}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Assignment ID</p><p className="text-gray-900">{selected.assignmentId}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Assigned To</p><p className="text-gray-900">{selected.assignedTo}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Employee Code</p><p className="text-gray-900">{selected.employeeCode}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Department</p><p className="text-gray-900">{selected.department}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Designation</p><p className="text-gray-900">{selected.designation}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Assignment Date</p><p className="text-gray-900">{selected.assignmentDate}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Return Date</p><p className="text-gray-900">{selected.returnDate ?? '—'}</p></div>
              <div className="md:col-span-2"><p className="text-xs text-gray-500 uppercase font-medium">Purpose</p><p className="text-gray-900">{selected.purpose}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Odometer Start</p><p className="text-gray-900">{selected.odometerReadingStart.toLocaleString('en-IN')} km</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Odometer End</p><p className="text-gray-900">{selected.odometerReadingEnd != null ? `${selected.odometerReadingEnd.toLocaleString('en-IN')} km` : '—'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Location</p><p className="text-gray-900">{selected.location}</p></div>
              <div className="md:col-span-2"><p className="text-xs text-gray-500 uppercase font-medium">Remarks</p><p className="text-gray-900">{selected.remarks ?? '—'}</p></div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Assignment modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">New Assignment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
                <input value={addForm.vehicleName} onChange={(e) => setAddForm({ ...addForm, vehicleName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input value={addForm.vehicleNumber} onChange={(e) => setAddForm({ ...addForm, vehicleNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input value={addForm.registrationNumber} onChange={(e) => setAddForm({ ...addForm, registrationNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input value={addForm.assignedTo} onChange={(e) => setAddForm({ ...addForm, assignedTo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <input value={addForm.employeeCode} onChange={(e) => setAddForm({ ...addForm, employeeCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input value={addForm.department} onChange={(e) => setAddForm({ ...addForm, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input value={addForm.designation} onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Odometer Start (km)</label>
                <input type="number" value={addForm.odometerReadingStart} onChange={(e) => setAddForm({ ...addForm, odometerReadingStart: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea value={addForm.purpose} onChange={(e) => setAddForm({ ...addForm, purpose: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                Cancel
              </button>
              <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Vehicle modal */}
      {returnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Return Vehicle</h2>
            <p className="text-sm text-gray-600 mb-3">{returnTarget.vehicleName} • {returnTarget.assignedTo}</p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Odometer End (km)</label>
                <input type="number" value={returnForm.odometerReadingEnd} onChange={(e) => setReturnForm({ ...returnForm, odometerReadingEnd: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea value={returnForm.remarks} onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setReturnTarget(null); setReturnForm({ odometerReadingEnd: '', remarks: '' }); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                Cancel
              </button>
              <button onClick={handleReturn} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
