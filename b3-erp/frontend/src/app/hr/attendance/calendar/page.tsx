'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { HrAttendanceService } from '@/services/hr-payroll.service';

interface DayAttendance {
  date: number;
  status: 'present' | 'absent' | 'leave' | 'holiday' | 'half_day' | 'late' | 'week_off';
  checkIn?: string;
  checkOut?: string;
}

export default function AttendanceCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date(2024, 10, 1)); // November 2024
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const employees = [
    { code: 'all', name: 'All Employees' },
    { code: 'KMF2020001', name: 'Rajesh Kumar' },
    { code: 'KMF2019002', name: 'Meera Nair' },
    { code: 'KMF2021003', name: 'Arun Patel' },
    { code: 'KMF2022004', name: 'Kavita Desai' }
  ];

  // Mock attendance data for November 2024
  const mockAttendance: DayAttendance[] = [
    { date: 1, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 2, status: 'week_off' },
    { date: 3, status: 'week_off' },
    { date: 4, status: 'present', checkIn: '09:15 AM', checkOut: '06:15 PM' },
    { date: 5, status: 'holiday' },
    { date: 6, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 7, status: 'late', checkIn: '09:30 AM', checkOut: '06:30 PM' },
    { date: 8, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 9, status: 'week_off' },
    { date: 10, status: 'week_off' },
    { date: 11, status: 'leave' },
    { date: 12, status: 'leave' },
    { date: 13, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 14, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 15, status: 'half_day', checkIn: '09:00 AM', checkOut: '01:00 PM' },
    { date: 16, status: 'week_off' },
    { date: 17, status: 'week_off' },
    { date: 18, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 19, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 20, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 21, status: 'late', checkIn: '09:45 AM', checkOut: '06:45 PM' },
    { date: 22, status: 'absent' },
    { date: 23, status: 'week_off' },
    { date: 24, status: 'week_off' },
    { date: 25, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 26, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 27, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 28, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 29, status: 'present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: 30, status: 'week_off' }
  ];

  const [rows, setRows] = useState<DayAttendance[]>(mockAttendance);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = await HrAttendanceService.getCalendar();
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            date: r.date ?? r.details?.date ?? 0,
            status: (r.status ?? r.details?.status ?? 'present') as DayAttendance['status'],
            checkIn: r.details?.checkIn,
            checkOut: r.details?.checkOut,
          } as DayAttendance));
          setRows(mapped);
        }
      } catch (e) { if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load'); }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      present: 'bg-green-100 text-green-800 border-green-300',
      absent: 'bg-red-100 text-red-800 border-red-300',
      leave: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      holiday: 'bg-blue-100 text-blue-800 border-blue-300',
      half_day: 'bg-orange-100 text-orange-800 border-orange-300',
      late: 'bg-purple-100 text-purple-800 border-purple-300',
      week_off: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      present: 'P',
      absent: 'A',
      leave: 'L',
      holiday: 'H',
      half_day: 'HD',
      late: 'LT',
      week_off: 'WO'
    };
    return labels[status as keyof typeof labels] || '-';
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(selectedMonth);
  const firstDayOfMonth = getFirstDayOfMonth(selectedMonth);

  const stats = {
    present: rows.filter(d => d.status === 'present').length,
    absent: rows.filter(d => d.status === 'absent').length,
    leave: rows.filter(d => d.status === 'leave').length,
    late: rows.filter(d => d.status === 'late').length
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-blue-600" />
          Attendance Calendar
        </h1>
        <p className="text-gray-600 mt-2">Visual calendar view of attendance records</p>
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      {/* Employee Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {employees.map(emp => (
                <option key={emp.code} value={emp.code}>
                  {emp.code === 'all' ? emp.name : `${emp.code} - ${emp.name}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Leave</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.leave}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-2xl font-bold text-purple-600">{stats.late}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2 text-sm">
              {day}
            </div>
          ))}

          {/* Empty cells before first day */}
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square border border-transparent p-2"></div>
          ))}

          {/* Calendar days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const attendance = rows.find(a => a.date === day);
            const status = attendance?.status || 'present';

            return (
              <div
                key={day}
                className={`aspect-square border-2 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer ${getStatusColor(status)}`}
              >
                <div className="h-full flex flex-col">
                  <div className="text-sm font-semibold mb-1">{day}</div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs font-bold">{getStatusLabel(status)}</span>
                  </div>
                  {attendance?.checkIn && (
                    <div className="text-xs mt-1 space-y-0.5">
                      <div>In: {attendance.checkIn}</div>
                      {attendance.checkOut && <div>Out: {attendance.checkOut}</div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-green-100 border-2 border-green-300 text-green-800 text-xs font-bold flex items-center justify-center">P</span>
            <span className="text-sm text-gray-700">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-red-100 border-2 border-red-300 text-red-800 text-xs font-bold flex items-center justify-center">A</span>
            <span className="text-sm text-gray-700">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-yellow-100 border-2 border-yellow-300 text-yellow-800 text-xs font-bold flex items-center justify-center">L</span>
            <span className="text-sm text-gray-700">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-blue-100 border-2 border-blue-300 text-blue-800 text-xs font-bold flex items-center justify-center">H</span>
            <span className="text-sm text-gray-700">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-orange-100 border-2 border-orange-300 text-orange-800 text-xs font-bold flex items-center justify-center">HD</span>
            <span className="text-sm text-gray-700">Half Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-purple-100 border-2 border-purple-300 text-purple-800 text-xs font-bold flex items-center justify-center">LT</span>
            <span className="text-sm text-gray-700">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-gray-100 border-2 border-gray-300 text-gray-800 text-xs font-bold flex items-center justify-center">WO</span>
            <span className="text-sm text-gray-700">Week Off</span>
          </div>
        </div>
      </div>
    </div>
  );
}
