'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Fingerprint, RefreshCw } from 'lucide-react';
import {
  AttendanceService,
  Attendance,
  AttendanceStatus
} from '@/services/attendance.service';
import { exportToCsv } from '@/lib/export';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  workHours: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'work_from_home';
  lateBy: number; // minutes
  earlyExit: number; // minutes
  overtimeHours: number;
  location: string;
  remarks: string;
  approvedBy: string | null;
}

// Transform service attendance to page format
const transformAttendance = (att: Attendance): AttendanceRecord => {
  const statusMap: Record<AttendanceStatus, AttendanceRecord['status']> = {
    [AttendanceStatus.PRESENT]: 'present',
    [AttendanceStatus.ABSENT]: 'absent',
    [AttendanceStatus.HALF_DAY]: 'half_day',
    [AttendanceStatus.LATE]: 'late',
    [AttendanceStatus.ON_LEAVE]: 'on_leave',
    [AttendanceStatus.WORK_FROM_HOME]: 'work_from_home',
    [AttendanceStatus.HOLIDAY]: 'present',
    [AttendanceStatus.WEEKEND]: 'present',
  };

  const checkInTime = att.checkInTime ? new Date(att.checkInTime) : null;
  const checkOutTime = att.checkOutTime ? new Date(att.checkOutTime) : null;

  // Calculate late minutes (assuming 9:00 AM standard)
  let lateBy = 0;
  if (checkInTime) {
    const standardStart = new Date(checkInTime);
    standardStart.setHours(9, 0, 0, 0);
    if (checkInTime > standardStart) {
      lateBy = Math.round((checkInTime.getTime() - standardStart.getTime()) / (1000 * 60));
    }
  }

  return {
    id: att.id,
    employeeId: att.employeeCode || att.employeeId,
    employeeName: att.employeeName || 'Unknown',
    department: att.departmentName || 'Unknown',
    date: new Date(att.date).toISOString().split('T')[0],
    checkIn: checkInTime ? checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
    checkOut: checkOutTime ? checkOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : null,
    workHours: att.totalHours || 0,
    status: statusMap[att.status],
    lateBy,
    earlyExit: 0,
    overtimeHours: att.overtimeHours || 0,
    location: att.location || 'Office',
    remarks: att.remarks || '',
    approvedBy: att.approvedBy || null,
  };
};

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    onLeave: 0,
    absent: 0,
    avgWorkHours: 0
  });
  const itemsPerPage = 10;

  // Load attendance data from service
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch attendance records and today's statistics
        const [records, todayStats] = await Promise.all([
          AttendanceService.getAttendance({ limit: 100 }),
          AttendanceService.getTodayStatistics()
        ]);

        setAttendanceRecords(records.map(transformAttendance));

        // Calculate average work hours
        const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
        const avgHours = records.length > 0 ? totalHours / records.length : 0;

        setStats({
          present: todayStats.present,
          onLeave: todayStats.onLeave,
          absent: todayStats.absent,
          avgWorkHours: Math.round(avgHours * 10) / 10
        });
      } catch (err) {
        console.error('Error loading attendance:', err);
        setError('Failed to load attendance records. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  const filteredAttendance = attendanceRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
  const paginatedAttendance = filteredAttendance.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const statusConfig = {
      present: { label: 'Present', color: 'bg-green-100 text-green-800 border-green-200' },
      absent: { label: 'Absent', color: 'bg-red-100 text-red-800 border-red-200' },
      late: { label: 'Late', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      half_day: { label: 'Half Day', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      on_leave: { label: 'On Leave', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      work_from_home: { label: 'WFH', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleBiometricSync = async () => {
    try {
      setIsSyncing(true);
      // Trigger a device-side pull; the backend fetches raw logs from the
      // configured biometric device and reconciles them into attendance.
      await AttendanceService.syncBiometricLogs('DEV-8829', []);
      alert('Biometric synchronization completed successfully!');
    } catch (err) {
      console.error('Sync error:', err);
      alert('Failed to sync biometric data.');
    } finally {
      setIsSyncing(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Present',
      value: stats.present.toString(),
      change: 'Today',
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      title: 'On Leave',
      value: stats.onLeave.toString(),
      change: 'Planned leaves',
      icon: AlertCircle,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Absent',
      value: stats.absent.toString(),
      change: 'Unplanned',
      icon: XCircle,
      gradient: 'from-red-500 to-rose-600',
    },
    {
      title: 'Avg Work Hours',
      value: `${stats.avgWorkHours}h`,
      change: 'Average',
      icon: Clock,
      gradient: 'from-blue-500 to-cyan-600',
    },
  ];

  // Get unique departments from attendance records
  const departments = ['all', ...Array.from(new Set(attendanceRecords.map(r => r.department)))];

  // Show loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen px-3 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full min-h-screen px-3 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-red-500 text-lg font-medium">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-3 py-2">
      <div className="w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {statsCards.map((stat, index) => {
            const gradientMap: { [key: string]: string } = {
              'from-green-500 to-emerald-600': 'from-green-50 to-green-100',
              'from-yellow-500 to-orange-600': 'from-yellow-50 to-yellow-100',
              'from-purple-500 to-pink-600': 'from-purple-50 to-purple-100',
              'from-red-500 to-rose-600': 'from-red-50 to-red-100',
              'from-blue-500 to-cyan-600': 'from-blue-50 to-blue-100'
            }
            const borderMap: { [key: string]: string } = {
              'from-green-500 to-emerald-600': 'border-green-200',
              'from-yellow-500 to-orange-600': 'border-yellow-200',
              'from-purple-500 to-pink-600': 'border-purple-200',
              'from-red-500 to-rose-600': 'border-red-200',
              'from-blue-500 to-cyan-600': 'border-blue-200'
            }
            const textMap: { [key: string]: { title: string; value: string } } = {
              'from-green-500 to-emerald-600': { title: 'text-green-600', value: 'text-green-900' },
              'from-yellow-500 to-orange-600': { title: 'text-yellow-600', value: 'text-yellow-900' },
              'from-purple-500 to-pink-600': { title: 'text-purple-600', value: 'text-purple-900' },
              'from-red-500 to-rose-600': { title: 'text-red-600', value: 'text-red-900' },
              'from-blue-500 to-cyan-600': { title: 'text-blue-600', value: 'text-blue-900' }
            }
            const iconMap: { [key: string]: string } = {
              'from-green-500 to-emerald-600': 'text-green-600',
              'from-yellow-500 to-orange-600': 'text-yellow-600',
              'from-purple-500 to-pink-600': 'text-purple-600',
              'from-red-500 to-rose-600': 'text-red-600',
              'from-blue-500 to-cyan-600': 'text-blue-600'
            }
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${gradientMap[stat.gradient]} rounded-lg p-3 border ${borderMap[stat.gradient]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${textMap[stat.gradient].title}`}>{stat.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${textMap[stat.gradient].value}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${iconMap[stat.gradient]}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, employee ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="on_leave">On Leave</option>
                  <option value="work_from_home">Work From Home</option>
                </select>
              </div>
            </div>
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={handleBiometricSync}
              disabled={isSyncing}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Fingerprint className="w-4 h-4 mr-2" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Biometric Data'}
            </button>
            <button
              onClick={() => exportToCsv('attendance', filteredAttendance as unknown as Record<string, unknown>[])}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)]">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Work Hours
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{record.employeeId}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{record.department}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{record.date}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{record.checkIn}</span>
                      {record.lateBy > 0 && (
                        <span className="ml-1 text-xs text-red-600">({record.lateBy}m late)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {record.checkOut || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{record.workHours}h</span>
                        {record.overtimeHours > 0 && (
                          <span className="ml-1 text-xs text-blue-600">(+{record.overtimeHours}h OT)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 font-medium mr-3">
                        View
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAttendance.length)} of {filteredAttendance.length} records
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === idx + 1
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-transparent'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
