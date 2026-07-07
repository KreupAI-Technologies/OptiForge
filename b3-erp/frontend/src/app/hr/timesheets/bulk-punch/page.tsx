'use client';

import { useState, useMemo, useEffect } from 'react';
import { Users, Save, Download, Upload, Search, Filter, Calendar, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { EmptyState } from '@/components/ui/EmptyState';
import { EmployeeService } from '@/services/employee.service';
import { HrPagesService } from '@/services/hr-pages.service';

interface EmployeePunch {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  shift: string;
  punchIn: string;
  punchOut: string;
  breakDuration: string;
  workHours: number;
  status: 'present' | 'absent' | 'late' | 'half_day';
  remarks?: string;
}

export default function BulkPunchPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedShift, setSelectedShift] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetched from the live employees endpoint; each employee seeds a blank
  // punch row that the supervisor can edit before saving.
  const [punchData, setPunchData] = useState<EmployeePunch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await EmployeeService.getAllEmployeesRaw()) as any[];
        const mapped: EmployeePunch[] = raw.map((r) => ({
          id: r.id,
          employeeCode: r.employeeCode ?? '',
          employeeName: r.fullName ?? [r.firstName, r.lastName].filter(Boolean).join(' '),
          department: r.departmentName ?? r.departmentId ?? '',
          shift: r.shiftName ?? '',
          punchIn: '',
          punchOut: '',
          breakDuration: '0',
          workHours: 0,
          status: 'absent',
        }));
        if (!cancelled) setPunchData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load employees');
          setPunchData([]);
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

  const filteredData = useMemo(() => {
    return punchData.filter(emp => {
      const matchesSearch =
        searchTerm === '' ||
        emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const matchesShift = selectedShift === 'all' || emp.shift === selectedShift;

      return matchesSearch && matchesDepartment && matchesShift;
    });
  }, [punchData, searchTerm, selectedDepartment, selectedShift]);

  const stats = useMemo(() => {
    return {
      total: punchData.length,
      present: punchData.filter(e => e.status === 'present').length,
      absent: punchData.filter(e => e.status === 'absent').length,
      late: punchData.filter(e => e.status === 'late').length,
      halfDay: punchData.filter(e => e.status === 'half_day').length
    };
  }, [punchData]);

  const updateField = (id: string, field: keyof EmployeePunch, value: any) => {
    setPunchData(punchData.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, [field]: value };

        // Auto-calculate work hours if punch times or break duration change
        if (field === 'punchIn' || field === 'punchOut' || field === 'breakDuration') {
          if (updated.punchIn && updated.punchOut) {
            const inTime = new Date(`2000-01-01T${updated.punchIn}`);
            const outTime = new Date(`2000-01-01T${updated.punchOut}`);
            const diffHours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
            const breakHours = parseInt(updated.breakDuration || '0') / 60;
            updated.workHours = Math.max(0, diffHours - breakHours);

            // Auto-update status
            if (updated.workHours === 0) {
              updated.status = 'absent';
            } else if (updated.workHours < 4) {
              updated.status = 'half_day';
            } else {
              updated.status = 'present';
            }
          }
        }

        return updated;
      }
      return emp;
    }));
  };

  const bulkApplyShift = (shiftType: string) => {
    const shiftTimes: Record<string, { punchIn: string; punchOut: string; breakDuration: string }> = {
      'morning': { punchIn: '06:00', punchOut: '14:00', breakDuration: '30' },
      'day': { punchIn: '09:00', punchOut: '17:00', breakDuration: '60' },
      'evening': { punchIn: '14:00', punchOut: '22:00', breakDuration: '30' },
      'night': { punchIn: '22:00', punchOut: '06:00', breakDuration: '30' }
    };

    const times = shiftTimes[shiftType];
    if (times) {
      setPunchData(punchData.map(emp => ({
        ...emp,
        punchIn: times.punchIn,
        punchOut: times.punchOut,
        breakDuration: times.breakDuration,
        workHours: shiftType === 'night' ? 7.5 : (shiftType === 'day' ? 7 : 7.5),
        status: 'present'
      })));
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Only persist rows the supervisor actually punched in for.
    const toSave = punchData.filter((emp) => emp.punchIn || emp.punchOut);
    if (toSave.length === 0) {
      alert('No punch entries to save.');
      return;
    }
    setIsSaving(true);
    setLoadError(null);
    try {
      await Promise.all(
        toSave.map((emp) =>
          HrPagesService.createAttendanceRecord({
            companyId: 'default-company-id',
            category: 'biometric',
            employeeId: emp.id,
            employeeName: emp.employeeName,
            employeeCode: emp.employeeCode,
            department: emp.department,
            date: selectedDate,
            totalHours: emp.workHours,
            status: emp.status,
            details: {
              shift: emp.shift,
              punchIn: emp.punchIn,
              punchOut: emp.punchOut,
              breakDuration: emp.breakDuration,
              remarks: emp.remarks ?? '',
            },
          }),
        ),
      );
      alert(`Punch data saved for ${toSave.length} employee(s).`);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to save punch data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    exportToCsv('bulk-punch', filteredData);
  };

  const handleImport = () => {
    // NOTE: Bulk import from Excel/CSV is not yet implemented on the backend.
    // The data view and per-row/bulk punch entry + save are fully wired to the
    // live employees and attendance endpoints; only file import remains stubbed.
    alert('Bulk import from Excel/CSV is not yet available. Please enter punch data directly in the table below and use "Save All Changes".');
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          Bulk Punch Entry
        </h1>
        <p className="text-gray-600 mt-2">Supervisor management for hundreds of factory workers - Quick bulk entry</p>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 text-sm mb-3">
          Loading employees…
        </div>
      )}
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2 text-sm mb-3">
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Present</p>
            <p className="text-3xl font-bold text-green-700">{stats.present}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Absent</p>
            <p className="text-3xl font-bold text-red-700">{stats.absent}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Late</p>
            <p className="text-3xl font-bold text-orange-700">{stats.late}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Half Day</p>
            <p className="text-3xl font-bold text-purple-700">{stats.halfDay}</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save All Changes
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="Production">Production</option>
                <option value="Assembly">Assembly</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Shifts</option>
                <option value="Morning (6AM-2PM)">Morning (6AM-2PM)</option>
                <option value="Day (9AM-5PM)">Day (9AM-5PM)</option>
                <option value="Evening (2PM-10PM)">Evening (2PM-10PM)</option>
                <option value="Night (10PM-6AM)">Night (10PM-6AM)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Quick Apply Shift Times</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => bulkApplyShift('morning')}
            className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
          >
            Morning Shift (6AM-2PM)
          </button>
          <button
            onClick={() => bulkApplyShift('day')}
            className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
          >
            Day Shift (9AM-5PM)
          </button>
          <button
            onClick={() => bulkApplyShift('evening')}
            className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
          >
            Evening Shift (2PM-10PM)
          </button>
          <button
            onClick={() => bulkApplyShift('night')}
            className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
          >
            Night Shift (10PM-6AM)
          </button>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Apply standard shift times to all filtered employees at once
        </p>
      </div>

      {/* Bulk Entry Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Employee Punch Records ({filteredData.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Edit multiple employee records in one go
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Punch In</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Punch Out</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Break (min)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Work Hrs</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-8">
                    <EmptyState
                      icon={Users}
                      title="No employees found"
                      description="No employees match the current filters, or none are available to record punches for."
                    />
                  </td>
                </tr>
              )}
              {filteredData.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{emp.employeeName}</div>
                    <div className="text-xs text-gray-500">{emp.employeeCode}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{emp.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{emp.shift}</td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={emp.punchIn}
                      onChange={(e) => updateField(emp.id, 'punchIn', e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={emp.punchOut}
                      onChange={(e) => updateField(emp.id, 'punchOut', e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      step="15"
                      value={emp.breakDuration}
                      onChange={(e) => updateField(emp.id, 'breakDuration', e.target.value)}
                      className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-semibold ${
                      emp.workHours >= 8 ? 'text-green-700' :
                      emp.workHours >= 4 ? 'text-blue-700' :
                      emp.workHours > 0 ? 'text-orange-700' :
                      'text-gray-400'
                    }`}>
                      {emp.workHours.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={emp.status}
                      onChange={(e) => updateField(emp.id, 'status', e.target.value)}
                      className={`w-28 px-2 py-1 text-xs font-medium border rounded focus:ring-2 focus:ring-blue-500 ${
                        emp.status === 'present' ? 'bg-green-50 text-green-700 border-green-200' :
                        emp.status === 'absent' ? 'bg-red-50 text-red-700 border-red-200' :
                        emp.status === 'late' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="half_day">Half Day</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Optional remarks..."
                      value={emp.remarks || ''}
                      onChange={(e) => updateField(emp.id, 'remarks', e.target.value)}
                      className="w-40 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Bulk Entry Tips</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Use <strong>Quick Apply Shift Times</strong> to set standard times for all filtered employees</li>
          <li>• <strong>Work hours</strong> are automatically calculated: (Punch Out - Punch In) - Break Duration</li>
          <li>• <strong>Status</strong> is auto-updated based on work hours (&lt; 4hrs = Half Day, 0hrs = Absent)</li>
          <li>• Use <strong>filters</strong> to manage specific departments or shifts efficiently</li>
          <li>• <strong>Import/Export</strong> Excel functionality for offline bulk editing</li>
          <li>• Remember to <strong>Save All Changes</strong> before leaving the page</li>
        </ul>
      </div>
    </div>
  );
}
