'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AttendanceService } from '@/services/attendance.service';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  TrendingUp,
  BarChart3,
  MapPin,
  Timer,
  Award,
  Building2,
} from 'lucide-react';

interface AttendanceRecord {
  date: string;
  dayOfWeek: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'half_day' | 'leave' | 'holiday';
  hoursWorked: number;
  overtime: number;
  lateBy: number;
  earlyLeave: number;
  location: string;
  remarks: string;
}

interface MonthSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  holidays: number;
  totalHours: number;
  overtimeHours: number;
  lateCount: number;
  attendancePercentage: number;
}

export default function ViewAttendancePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [activeTab, setActiveTab] = useState<'details' | 'summary' | 'analytics'>('details');

  // Mock employee info
  const employee = {
    id: params.id,
    employeeId: 'B3-001',
    name: 'Rajesh Kumar',
    department: 'Production',
    position: 'Production Manager',
  };

  // Attendance records (live)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const fmtTime = (v: any): string => {
      if (!v) return '-';
      const d = new Date(v);
      if (isNaN(d.getTime())) return '-';
      return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    };
    const mapStatus = (s: any): AttendanceRecord['status'] => {
      switch (String(s ?? '').toUpperCase()) {
        case 'PRESENT': return 'present';
        case 'ABSENT': return 'absent';
        case 'LATE': return 'present';
        case 'HALF_DAY': return 'half_day';
        case 'ON_LEAVE': return 'leave';
        case 'HOLIDAY':
        case 'WEEKEND': return 'holiday';
        default: return 'present';
      }
    };
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = await AttendanceService.getAttendance({ employeeId: params.id });
        const mapped: AttendanceRecord[] = (raw as any[]).map((r) => {
          const d = r?.date ? new Date(r.date) : null;
          return {
            date: d && !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : String(r?.date ?? ''),
            dayOfWeek: d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { weekday: 'long' }) : '',
            checkIn: fmtTime(r?.checkInTime),
            checkOut: fmtTime(r?.checkOutTime),
            status: mapStatus(r?.status),
            hoursWorked: r?.totalHours ?? 0,
            overtime: r?.overtimeHours ?? 0,
            lateBy: r?.lateBy ?? 0,
            earlyLeave: r?.earlyLeave ?? 0,
            location: r?.location ?? '-',
            remarks: r?.remarks ?? '',
          };
        });
        if (!cancelled) setAttendanceRecords(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setAttendanceRecords([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  // Mock month summary
  const monthSummary: MonthSummary = {
    totalDays: 20,
    presentDays: 16,
    absentDays: 1,
    halfDays: 1,
    leaveDays: 1,
    holidays: 4,
    totalHours: 144.5,
    overtimeHours: 2.5,
    lateCount: 3,
    attendancePercentage: 94,
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'present':
        return { label: 'Present', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'absent':
        return { label: 'Absent', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> };
      case 'half_day':
        return { label: 'Half Day', color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle className="w-4 h-4" /> };
      case 'leave':
        return { label: 'Leave', color: 'bg-blue-100 text-blue-700', icon: <Calendar className="w-4 h-4" /> };
      case 'holiday':
        return { label: 'Holiday', color: 'bg-purple-100 text-purple-700', icon: <Calendar className="w-4 h-4" /> };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
    }
  };

  const handleBack = () => {
    router.push('/hr/attendance');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full">
        {isLoading && (<div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">Loading…</div>)}
        {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Details</h1>
              <p className="text-gray-600 mt-1">
                {employee.name} ({employee.employeeId}) • {employee.position}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
            <CheckCircle2 className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{monthSummary.presentDays}</div>
            <div className="text-green-100 text-sm">Present Days</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl text-white">
            <XCircle className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{monthSummary.absentDays}</div>
            <div className="text-red-100 text-sm">Absent Days</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
            <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{monthSummary.attendancePercentage}%</div>
            <div className="text-blue-100 text-sm">Attendance Rate</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
            <Clock className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{monthSummary.totalHours.toFixed(1)}</div>
            <div className="text-purple-100 text-sm">Total Hours</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
            <Timer className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{monthSummary.overtimeHours.toFixed(1)}</div>
            <div className="text-orange-100 text-sm">Overtime Hours</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Daily Details
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly Summary
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Daily Details Tab */}
            {activeTab === 'details' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Daily Attendance Records</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Day</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check In</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check Out</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendanceRecords.map((record, index) => {
                        const statusConfig = getStatusConfig(record.status);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 font-semibold text-gray-900">
                              {new Date(record.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </td>
                            <td className="px-4 py-4 text-gray-600">{record.dayOfWeek}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {record.checkIn !== '-' && <Clock className="w-4 h-4 text-green-600" />}
                                <span className={`font-semibold ${record.checkIn !== '-' ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {record.checkIn}
                                </span>
                                {record.lateBy > 0 && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                    Late {record.lateBy}m
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {record.checkOut !== '-' && <Clock className="w-4 h-4 text-red-600" />}
                                <span className={`font-semibold ${record.checkOut !== '-' ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {record.checkOut}
                                </span>
                                {record.earlyLeave > 0 && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                                    Early {Math.floor(record.earlyLeave / 60)}h {record.earlyLeave % 60}m
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {record.hoursWorked > 0 ? (
                                <div>
                                  <div className="font-semibold text-gray-900">{record.hoursWorked.toFixed(2)} hrs</div>
                                  {record.overtime > 0 && (
                                    <div className="text-xs text-orange-600">+{record.overtime.toFixed(2)} OT</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${statusConfig.color}`}>
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {record.remarks || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Summary</h3>

                {/* Attendance Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Attendance Breakdown
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Present Days</span>
                        <span className="font-bold text-green-600">{monthSummary.presentDays} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Absent Days</span>
                        <span className="font-bold text-red-600">{monthSummary.absentDays} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Half Days</span>
                        <span className="font-bold text-yellow-600">{monthSummary.halfDays} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Leave Days</span>
                        <span className="font-bold text-blue-600">{monthSummary.leaveDays} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Holidays</span>
                        <span className="font-bold text-purple-600">{monthSummary.holidays} days</span>
                      </div>
                      <div className="pt-3 border-t border-blue-300 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total Working Days</span>
                        <span className="font-bold text-blue-600">{monthSummary.totalDays} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Work Hours Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Hours Worked</span>
                        <span className="font-bold text-purple-600">{monthSummary.totalHours.toFixed(1)} hrs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Overtime Hours</span>
                        <span className="font-bold text-orange-600">{monthSummary.overtimeHours.toFixed(1)} hrs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Average Hours/Day</span>
                        <span className="font-bold text-green-600">
                          {(monthSummary.totalHours / monthSummary.presentDays).toFixed(2)} hrs
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Late Count</span>
                        <span className="font-bold text-red-600">{monthSummary.lateCount} times</span>
                      </div>
                      <div className="pt-3 border-t border-purple-300 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Attendance Rate</span>
                        <span className="font-bold text-purple-600">{monthSummary.attendancePercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Attendance Performance
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-700">Attendance Rate</span>
                        <span className="font-bold text-green-600">{monthSummary.attendancePercentage}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${monthSummary.attendancePercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      {monthSummary.attendancePercentage >= 95 ? (
                        <div>
                          <div className="text-4xl mb-2">🏆</div>
                          <div className="font-bold text-green-600">Excellent</div>
                        </div>
                      ) : monthSummary.attendancePercentage >= 85 ? (
                        <div>
                          <div className="text-4xl mb-2">⭐</div>
                          <div className="font-bold text-blue-600">Good</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl mb-2">📊</div>
                          <div className="font-bold text-yellow-600">Average</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Attendance Analytics & Insights</h3>

                {/* Attendance Timeline Visualization */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Attendance Timeline (Last 20 Days)
                  </h4>
                  <div className="flex gap-1.5">
                    {[...attendanceRecords].reverse().map((record, idx) => {
                      const statusColors = {
                        present: 'bg-green-500 hover:bg-green-600',
                        absent: 'bg-red-500 hover:bg-red-600',
                        half_day: 'bg-yellow-500 hover:bg-yellow-600',
                        leave: 'bg-blue-500 hover:bg-blue-600',
                        holiday: 'bg-purple-500 hover:bg-purple-600',
                      };
                      return (
                        <div
                          key={idx}
                          className={`h-16 flex-1 ${statusColors[record.status]} rounded-lg transition-all cursor-pointer group relative`}
                          title={`${record.date} - ${record.status}`}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            <div className="font-semibold">{new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                            <div className="text-gray-300">{record.status.replace('_', ' ').toUpperCase()}</div>
                            {record.hoursWorked > 0 && <div className="text-gray-300">{record.hoursWorked.toFixed(1)} hrs</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-700">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-gray-700">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-gray-700">Half Day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-700">Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-gray-700">Holiday</span>
                    </div>
                  </div>
                </div>

                {/* Punctuality Analysis */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Timer className="w-5 h-5 text-green-600" />
                      Punctuality Score
                    </h4>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-600 mb-2">85%</div>
                      <p className="text-sm text-gray-600 mb-2">On-time check-ins</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Early Arrivals</span>
                          <span className="font-semibold text-green-600">12 days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">On Time</span>
                          <span className="font-semibold text-blue-600">4 days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Late Arrivals</span>
                          <span className="font-semibold text-red-600">3 days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Anomalies Detected
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">Consecutive Late Arrivals</div>
                            <div className="text-xs text-gray-600 mt-1">3 late check-ins in last week (Jan 18-20)</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">Extended Lunch Break</div>
                            <div className="text-xs text-gray-600 mt-1">Jan 17 - Early checkout detected</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">Perfect Week</div>
                            <div className="text-xs text-gray-600 mt-1">Week of Jan 8-12 - 100% on-time</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Tracking Insights */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Location Tracking
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-4 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Factory - Building A</div>
                          <div className="text-xs text-gray-600">Primary Location</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">18 days</div>
                      <div className="text-sm text-gray-600">95% of check-ins</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Head Office</div>
                          <div className="text-xs text-gray-600">Secondary Location</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">1 day</div>
                      <div className="text-sm text-gray-600">5% of check-ins</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Geo-fence Status</div>
                          <div className="text-xs text-gray-600">Compliance</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">100%</div>
                      <div className="text-sm text-gray-600">Valid location</div>
                    </div>
                  </div>
                </div>

                {/* Shift Pattern Analysis */}
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Work Pattern Analysis
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="text-3xl font-bold text-indigo-600 mb-1">9.1</div>
                      <div className="text-sm text-gray-600">Avg Hours/Day</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="text-3xl font-bold text-orange-600 mb-1">2.5</div>
                      <div className="text-sm text-gray-600">Total OT Hours</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="text-3xl font-bold text-green-600 mb-1">5</div>
                      <div className="text-sm text-gray-600">Perfect Days</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">Day</div>
                      <div className="text-sm text-gray-600">Current Shift</div>
                    </div>
                  </div>
                </div>

                {/* Predictive Insights */}
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                    Predictive Insights & Recommendations
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Excellent Attendance</div>
                        <div className="text-sm text-gray-600 mt-1">
                          94% attendance rate is above company average of 90%. On track for monthly attendance bonus.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Punctuality Alert</div>
                        <div className="text-sm text-gray-600 mt-1">
                          3 late arrivals detected in last 5 working days. Please ensure timely check-ins to maintain excellent record.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Overtime Notice</div>
                        <div className="text-sm text-gray-600 mt-1">
                          2.5 hours of overtime accumulated this month. Eligible for OT compensation as per policy.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
