'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Search, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import { HrAttendanceService } from '@/services/hr-payroll.service';

interface MonthlyAttendance {
  id: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  totalDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateMarks: number;
  halfDays: number;
  paidLeaves: number;
  unpaidLeaves: number;
  weekOffs: number;
  holidays: number;
  workHours: number;
  expectedHours: number;
  attendancePercentage: number;
  punctualityScore: number;
}

export default function MonthlyAttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2024-11');
  const [showFilters, setShowFilters] = useState(false);

  const mockMonthlyAttendance: MonthlyAttendance[] = [
    {
      id: '1', employeeCode: 'KMF2020001', name: 'Rajesh Kumar', department: 'Production', designation: 'Manager',
      totalDays: 30, workingDays: 22, presentDays: 21, absentDays: 1, lateMarks: 3, halfDays: 0,
      paidLeaves: 0, unpaidLeaves: 0, weekOffs: 4, holidays: 4, workHours: 189, expectedHours: 198,
      attendancePercentage: 95.45, punctualityScore: 86.36
    },
    {
      id: '2', employeeCode: 'KMF2019002', name: 'Meera Nair', department: 'Quality', designation: 'QC Head',
      totalDays: 30, workingDays: 22, presentDays: 20, absentDays: 0, lateMarks: 5, halfDays: 1,
      paidLeaves: 2, unpaidLeaves: 0, weekOffs: 4, holidays: 4, workHours: 185.5, expectedHours: 198,
      attendancePercentage: 100, punctualityScore: 77.27
    },
    {
      id: '3', employeeCode: 'KMF2021003', name: 'Arun Patel', department: 'IT', designation: 'Sr. Engineer',
      totalDays: 30, workingDays: 22, presentDays: 22, absentDays: 0, lateMarks: 1, halfDays: 0,
      paidLeaves: 0, unpaidLeaves: 0, weekOffs: 4, holidays: 4, workHours: 198, expectedHours: 198,
      attendancePercentage: 100, punctualityScore: 95.45
    },
    {
      id: '4', employeeCode: 'KMF2022004', name: 'Kavita Desai', department: 'HR', designation: 'Executive',
      totalDays: 30, workingDays: 22, presentDays: 19, absentDays: 0, lateMarks: 2, halfDays: 2,
      paidLeaves: 3, unpaidLeaves: 0, weekOffs: 4, holidays: 4, workHours: 180, expectedHours: 198,
      attendancePercentage: 100, punctualityScore: 90.91
    },
    {
      id: '5', employeeCode: 'KMF2020005', name: 'Vikram Singh', department: 'Production', designation: 'Supervisor',
      totalDays: 30, workingDays: 22, presentDays: 22, absentDays: 0, lateMarks: 0, halfDays: 0,
      paidLeaves: 0, unpaidLeaves: 0, weekOffs: 4, holidays: 4, workHours: 198, expectedHours: 198,
      attendancePercentage: 100, punctualityScore: 100
    },
    {
      id: '6', employeeCode: 'KMF2018006', name: 'Priya Menon', department: 'Finance', designation: 'Accountant',
      totalDays: 30, workingDays: 22, presentDays: 18, absentDays: 2, lateMarks: 4, halfDays: 1,
      paidLeaves: 2, unpaidLeaves: 0, weekOffs: 4, holidays: 4, workHours: 171, expectedHours: 198,
      attendancePercentage: 90.91, punctualityScore: 81.82
    },
    {
      id: '7', employeeCode: 'KMF2019007', name: 'Suresh Babu', department: 'Logistics', designation: 'Manager',
      totalDays: 30, workingDays: 22, presentDays: 21, absentDays: 1, lateMarks: 2, halfDays: 0,
      paidLeaves: 0, unpaidLeaves: 0, weekOffs: 4, holidays: 4, workHours: 189, expectedHours: 198,
      attendancePercentage: 95.45, punctualityScore: 90.91
    },
    {
      id: '8', employeeCode: 'KMF2021008', name: 'Anjali Reddy', department: 'Marketing', designation: 'Executive',
      totalDays: 30, workingDays: 22, presentDays: 20, absentDays: 0, lateMarks: 6, halfDays: 0,
      paidLeaves: 2, unpaidLeaves: 0, weekOffs: 4, holidays: 4, workHours: 180, expectedHours: 198,
      attendancePercentage: 100, punctualityScore: 72.73
    },
  ];

  const departments = ['all', 'Production', 'Quality', 'IT', 'HR', 'Finance', 'Logistics', 'Marketing'];

  const [rows, setRows] = useState<MonthlyAttendance[]>(mockMonthlyAttendance);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = await HrAttendanceService.getMonthly();
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            id: String(r.id ?? r.employeeId ?? ''),
            employeeCode: r.employeeCode ?? r.details?.employeeCode ?? '',
            name: r.employeeName ?? r.name ?? r.details?.name ?? '',
            department: r.department ?? r.details?.department ?? '',
            designation: r.details?.designation ?? '',
            totalDays: r.details?.totalDays ?? 30,
            workingDays: r.details?.workingDays ?? 22,
            presentDays: r.presentDays ?? r.details?.presentDays ?? 0,
            absentDays: r.absentDays ?? r.details?.absentDays ?? 0,
            lateMarks: r.details?.lateMarks ?? 0,
            halfDays: r.details?.halfDays ?? 0,
            paidLeaves: r.details?.paidLeaves ?? 0,
            unpaidLeaves: r.details?.unpaidLeaves ?? 0,
            weekOffs: r.details?.weekOffs ?? 0,
            holidays: r.details?.holidays ?? 0,
            workHours: r.totalHours ?? r.details?.workHours ?? 0,
            expectedHours: r.details?.expectedHours ?? 198,
            attendancePercentage: r.details?.attendancePercentage ?? 0,
            punctualityScore: r.details?.punctualityScore ?? 0,
          } as MonthlyAttendance));
          setRows(mapped);
        }
      } catch (e) { if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load'); }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredData = useMemo(() => {
    return rows.filter(att => {
      const matchesSearch = att.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          att.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || att.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [searchTerm, selectedDepartment, rows]);

  const stats = useMemo(() => {
    const totalEmployees = rows.length;
    const avgAttendance = rows.reduce((sum, a) => sum + a.attendancePercentage, 0) / totalEmployees;
    const avgPunctuality = rows.reduce((sum, a) => sum + a.punctualityScore, 0) / totalEmployees;
    const perfectAttendance = rows.filter(a => a.attendancePercentage === 100 && a.lateMarks === 0).length;
    const poorAttendance = rows.filter(a => a.attendancePercentage < 90).length;
    return { totalEmployees, avgAttendance, avgPunctuality, perfectAttendance, poorAttendance };
  }, [rows]);

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600 bg-green-50';
    if (percentage >= 85) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPunctualityBadge = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const columns: Column<MonthlyAttendance>[] = [
    { id: 'employeeCode', accessor: 'employeeCode', label: 'Employee', sortable: true,
      render: (v: string, row: MonthlyAttendance) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-sm">{row.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">{v}</div>
          </div>
        </div>
      )
    },
    { id: 'department', accessor: 'department', label: 'Department', sortable: true,
      render: (v: string, row: MonthlyAttendance) => (
        <div><div className="font-medium text-gray-900">{v}</div><div className="text-xs text-gray-500">{row.designation}</div></div>
      )
    },
    { id: 'presentDays', accessor: 'presentDays', label: 'Days', sortable: true,
      render: (v: number, row: MonthlyAttendance) => (
        <div className="text-sm">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{v}</div>
              <div className="text-xs text-gray-500">Present</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{row.absentDays}</div>
              <div className="text-xs text-gray-500">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{row.paidLeaves}</div>
              <div className="text-xs text-gray-500">Leave</div>
            </div>
          </div>
        </div>
      )
    },
    { id: 'lateMarks', accessor: 'lateMarks', label: 'Late/Half Day', sortable: true,
      render: (v: number, row: MonthlyAttendance) => (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-gray-900">{v} late</span>
          </div>
          {row.halfDays > 0 && (
            <div className="text-xs text-gray-500 mt-1">{row.halfDays} half day(s)</div>
          )}
        </div>
      )
    },
    { id: 'workHours', accessor: 'workHours', label: 'Hours', sortable: true,
      render: (v: number, row: MonthlyAttendance) => (
        <div className="text-sm">
          <div className="font-semibold text-blue-600">{v}h</div>
          <div className="text-xs text-gray-500">of {row.expectedHours}h</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(v / row.expectedHours) * 100}%` }}></div>
          </div>
        </div>
      )
    },
    { id: 'attendancePercentage', accessor: 'attendancePercentage', label: 'Attendance %', sortable: true,
      render: (v: number) => (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold ${getAttendanceBadge(v)}`}>
          {v >= 95 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {v.toFixed(1)}%
        </div>
      )
    },
    { id: 'punctualityScore', accessor: 'punctualityScore', label: 'Punctuality', sortable: true,
      render: (v: number) => (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold ${getPunctualityBadge(v)}`}>
          {v >= 90 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {v.toFixed(1)}%
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-blue-600" />
          Monthly Attendance
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive monthly attendance summary and analytics
        </p>
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalEmployees}</p>
            </div>
            <Users className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgAttendance.toFixed(1)}%</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Punctuality</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgPunctuality.toFixed(1)}%</p>
            </div>
            <Clock className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Perfect Attendance</p>
              <p className="text-2xl font-bold text-purple-600">{stats.perfectAttendance}</p>
              <p className="text-xs text-gray-500 mt-1">No absents or lates</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Poor Attendance</p>
              <p className="text-2xl font-bold text-red-600">{stats.poorAttendance}</p>
              <p className="text-xs text-gray-500 mt-1">Below 90%</p>
            </div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
      </div>

      {/* Month Selector & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="pt-7">
              <span className="text-sm text-gray-600">
                Showing data for <span className="font-semibold text-gray-900">
                  {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-7">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name or employee code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <DataTable data={filteredData} columns={columns} />

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend & Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Attendance Percentage</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">≥ 95% - Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">85% - 94% - Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">&lt; 85% - Needs Improvement</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Punctuality Score</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">≥ 90% - Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">75% - 89% - Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">&lt; 75% - Needs Improvement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
