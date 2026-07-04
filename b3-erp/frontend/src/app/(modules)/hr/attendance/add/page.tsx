'use client';

import React, { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  Clock,
  MapPin,
  Calendar,
  User,
  Search,
  CheckCircle2,
  AlertTriangle,
  Users,
} from 'lucide-react';

interface AttendanceEntry {
  employeeId: string;
  employeeName: string;
  department: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  remarks: string;
}

export default function MarkAttendancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkStatus, setBulkStatus] = useState<'present' | 'absent' | ''>('');

  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDataLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.get<any[]>('/hr/attendance-records');
        if (!cancelled) setAttendanceEntries(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setAttendanceEntries([]);
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleEntryChange = (index: number, field: keyof AttendanceEntry, value: any) => {
    const updatedEntries = [...attendanceEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };

    // Auto-clear times if status is absent or leave
    if (field === 'status' && (value === 'absent' || value === 'leave')) {
      updatedEntries[index].checkIn = '';
      updatedEntries[index].checkOut = '';
    }

    setAttendanceEntries(updatedEntries);
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus) return;

    const updatedEntries = attendanceEntries.map(entry => ({
      ...entry,
      status: bulkStatus,
      checkIn: bulkStatus === 'present' ? '09:00' : '',
      checkOut: bulkStatus === 'present' ? '18:00' : '',
    }));

    setAttendanceEntries(updatedEntries);
    setBulkStatus('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedDate) {
      newErrors.date = 'Date is required';
    }

    attendanceEntries.forEach((entry, index) => {
      if (entry.status === 'present' || entry.status === 'half_day') {
        if (!entry.checkIn) {
          newErrors[`checkIn_${index}`] = 'Check-in time required';
        }
        if (!entry.checkOut) {
          newErrors[`checkOut_${index}`] = 'Check-out time required';
        }
        if (entry.checkIn && entry.checkOut && entry.checkIn >= entry.checkOut) {
          newErrors[`checkOut_${index}`] = 'Check-out must be after check-in';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/hr/attendance');
    }, 1500);
  };

  const handleCancel = () => {
    router.push('/hr/attendance');
  };

  const filteredEntries = attendanceEntries.filter(entry =>
    entry.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'present':
        return { label: 'Present', color: 'bg-green-100 text-green-700 border-green-300' };
      case 'absent':
        return { label: 'Absent', color: 'bg-red-100 text-red-700 border-red-300' };
      case 'half_day':
        return { label: 'Half Day', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
      case 'leave':
        return { label: 'Leave', color: 'bg-blue-100 text-blue-700 border-blue-300' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  const stats = {
    total: attendanceEntries.length,
    present: attendanceEntries.filter(e => e.status === 'present').length,
    absent: attendanceEntries.filter(e => e.status === 'absent').length,
    halfDay: attendanceEntries.filter(e => e.status === 'half_day').length,
    leave: attendanceEntries.filter(e => e.status === 'leave').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
              <p className="text-gray-600 mt-1">Record daily attendance for all employees</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Attendance
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
            <Users className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-blue-100 text-sm">Total Employees</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
            <CheckCircle2 className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stats.present}</div>
            <div className="text-green-100 text-sm">Present</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl text-white">
            <X className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stats.absent}</div>
            <div className="text-red-100 text-sm">Absent</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-xl text-white">
            <AlertTriangle className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stats.halfDay}</div>
            <div className="text-yellow-100 text-sm">Half Day</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
            <Calendar className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stats.leave}</div>
            <div className="text-purple-100 text-sm">On Leave</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Date and Bulk Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Action
                </label>
                <div className="flex gap-2">
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as any)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="present">Mark All Present</option>
                    <option value="absent">Mark All Absent</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleBulkStatusChange}
                    disabled={!bulkStatus}
                    className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Employees
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search by name, ID, or department"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Entries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Employee Attendance</h2>

            <div className="space-y-3">
              {filteredEntries.map((entry, index) => {
                const actualIndex = attendanceEntries.findIndex(e => e.employeeId === entry.employeeId);
                const statusConfig = getStatusConfig(entry.status);

                return (
                  <div key={entry.employeeId} className={`p-4 border-2 rounded-lg ${statusConfig.color}`}>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-2">
                        <div className="font-bold text-gray-900">{entry.employeeName}</div>
                        <div className="text-sm text-gray-600">{entry.employeeId}</div>
                      </div>

                      <div className="col-span-1">
                        <div className="text-sm text-gray-600">{entry.department}</div>
                      </div>

                      <div className="col-span-2">
                        <select
                          value={entry.status}
                          onChange={(e) => handleEntryChange(actualIndex, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="half_day">Half Day</option>
                          <option value="leave">Leave</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <input
                            type="time"
                            value={entry.checkIn}
                            onChange={(e) => handleEntryChange(actualIndex, 'checkIn', e.target.value)}
                            disabled={entry.status === 'absent' || entry.status === 'leave'}
                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`checkIn_${actualIndex}`] ? 'border-red-500' : 'border-gray-300'
                            } disabled:bg-gray-100 disabled:text-gray-400`}
                          />
                        </div>
                        {errors[`checkIn_${actualIndex}`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`checkIn_${actualIndex}`]}</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <input
                            type="time"
                            value={entry.checkOut}
                            onChange={(e) => handleEntryChange(actualIndex, 'checkOut', e.target.value)}
                            disabled={entry.status === 'absent' || entry.status === 'leave'}
                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`checkOut_${actualIndex}`] ? 'border-red-500' : 'border-gray-300'
                            } disabled:bg-gray-100 disabled:text-gray-400`}
                          />
                        </div>
                        {errors[`checkOut_${actualIndex}`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`checkOut_${actualIndex}`]}</p>
                        )}
                      </div>

                      <div className="col-span-3">
                        <input
                          type="text"
                          value={entry.remarks}
                          onChange={(e) => handleEntryChange(actualIndex, 'remarks', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Remarks (optional)"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No employees found matching your search.
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Attendance...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Attendance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
