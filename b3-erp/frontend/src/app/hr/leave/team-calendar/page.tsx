'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Users, Filter, X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HrPagesService } from '@/services/hr-pages.service';

interface TeamLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  leaveTypeCode: string;
  leaveColor: string;
  fromDate: string;
  toDate: string;
  days: number;
  status: 'approved' | 'pending';
  isHalfDay: boolean;
  session?: 'morning' | 'afternoon';
}

const departments = ['All Departments', 'Production', 'Quality', 'Maintenance', 'HR', 'Stores'];

/** Derive a stable calendar colour + short code from a leave type name. */
function leaveTypeMeta(name: string): { code: string; color: string } {
  const n = (name || '').toLowerCase();
  if (n.includes('casual')) return { code: 'CL', color: 'bg-green-500' };
  if (n.includes('sick')) return { code: 'SL', color: 'bg-red-500' };
  if (n.includes('matern')) return { code: 'ML', color: 'bg-pink-500' };
  if (n.includes('comp')) return { code: 'CO', color: 'bg-orange-500' };
  if (n.includes('privilege')) return { code: 'PL', color: 'bg-purple-500' };
  if (n.includes('earn') || n.includes('annual')) return { code: 'EL', color: 'bg-blue-500' };
  return { code: (name || '?').slice(0, 2).toUpperCase(), color: 'bg-gray-500' };
}
const leaveTypes = [
  { code: 'ALL', name: 'All Types', color: 'bg-gray-500' },
  { code: 'EL', name: 'Earned Leave', color: 'bg-blue-500' },
  { code: 'CL', name: 'Casual Leave', color: 'bg-green-500' },
  { code: 'SL', name: 'Sick Leave', color: 'bg-red-500' },
  { code: 'PL', name: 'Privilege Leave', color: 'bg-purple-500' },
  { code: 'CO', name: 'Comp Off', color: 'bg-orange-500' },
  { code: 'ML', name: 'Maternity Leave', color: 'bg-pink-500' }
];

export default function TeamCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 25)); // October 25, 2025
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedLeaveType, setSelectedLeaveType] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [teamLeaves, setTeamLeaves] = useState<TeamLeave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.leaveApplications()) as any[];
        const mapped: TeamLeave[] = (raw ?? []).map((r, i) => {
          const meta = leaveTypeMeta(r.leaveTypeName ?? r.leaveType ?? '');
          const rawStatus = String(r.status ?? '').toLowerCase();
          return {
            id: String(r.id ?? `TL${i}`),
            employeeId: String(r.employeeId ?? ''),
            employeeName: r.employeeName ?? 'Unknown',
            department: r.department ?? 'Unassigned',
            leaveType: r.leaveTypeName ?? r.leaveType ?? 'Leave',
            leaveTypeCode: meta.code,
            leaveColor: meta.color,
            fromDate: r.startDate ?? r.fromDate ?? '',
            toDate: r.endDate ?? r.toDate ?? r.startDate ?? '',
            days: Number(r.numberOfDays ?? r.days ?? 0),
            status: rawStatus === 'approved' ? 'approved' : 'pending',
            isHalfDay: Boolean(r.isHalfDay) || Number(r.numberOfDays ?? 0) === 0.5,
            session: r.session,
          };
        });
        if (!cancelled) setTeamLeaves(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load team leaves');
          setTeamLeaves([]);
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

  const filteredLeaves = useMemo(() => {
    return teamLeaves.filter(leave => {
      const matchesDept = selectedDepartment === 'All Departments' || leave.department === selectedDepartment;
      const matchesType = selectedLeaveType === 'ALL' || leave.leaveTypeCode === selectedLeaveType;
      return matchesDept && matchesType;
    });
  }, [teamLeaves, selectedDepartment, selectedLeaveType]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isDateInRange = (date: Date, fromDate: string, toDate: string) => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return checkDate >= from && checkDate <= to;
  };

  const getLeavesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredLeaves.filter(leave => isDateInRange(date, leave.fromDate, leave.toDate));
  };

  const today = new Date();
  const todaysLeaves = useMemo(() => {
    return filteredLeaves.filter(leave => isDateInRange(today, leave.fromDate, leave.toDate) && leave.status === 'approved');
  }, [filteredLeaves]);

  const upcomingLeaves = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return filteredLeaves.filter(leave => {
      const leaveStart = new Date(leave.fromDate);
      return leaveStart > today && leaveStart <= nextWeek && leave.status === 'approved';
    }).sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());
  }, [filteredLeaves]);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-gray-50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const leavesForDay = getLeavesForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      days.push(
        <div key={day} className={`min-h-[100px] border border-gray-200 p-2 ${isWeekend ? 'bg-gray-50' : 'bg-white'} ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : isWeekend ? 'text-gray-400' : 'text-gray-700'}`}>
            {day}
            {isToday && <span className="ml-1 text-xs bg-blue-500 text-white px-1 rounded">Today</span>}
          </div>
          <div className="space-y-1">
            {leavesForDay.slice(0, 3).map(leave => (
              <div key={leave.id} className={`text-xs ${leave.leaveColor} text-white px-1 py-0.5 rounded truncate`} title={`${leave.employeeName} - ${leave.leaveType}`}>
                {leave.employeeName.split(' ')[0]}
                {leave.isHalfDay && <span className="ml-1">({leave.session === 'morning' ? 'AM' : 'PM'})</span>}
              </div>
            ))}
            {leavesForDay.length > 3 && (
              <div className="text-xs text-gray-500 font-medium">+{leavesForDay.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const clearFilters = () => {
    setSelectedDepartment('All Departments');
    setSelectedLeaveType('ALL');
  };

  const activeFilterCount = [selectedDepartment !== 'All Departments', selectedLeaveType !== 'ALL'].filter(Boolean).length;

  const stats = useMemo(() => {
    const totalOnLeave = todaysLeaves.length;
    const thisMonth = filteredLeaves.filter(leave => {
      const leaveDate = new Date(leave.fromDate);
      return leaveDate.getMonth() === currentDate.getMonth() && leaveDate.getFullYear() === currentDate.getFullYear();
    }).length;
    return { totalOnLeave, thisMonth, upcoming: upcomingLeaves.length };
  }, [todaysLeaves, filteredLeaves, upcomingLeaves, currentDate]);

  return (
    <div className="p-6 space-y-3">
      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading team leaves…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-blue-600" />
            Team Leave Calendar
          </h1>
          <p className="text-gray-600 mt-1">View team availability and plan resources</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" /> On Leave Today
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.totalOnLeave}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Leaves This Month</div>
          <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Upcoming (Next 7 Days)</div>
          <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
        {showFilters && (
          <div className="pt-4 border-t grid md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select value={selectedLeaveType} onChange={(e) => setSelectedLeaveType(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                {leaveTypes.map(type => <option key={type.code} value={type.code}>{type.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="bg-gray-50 border-b px-3 py-2 flex items-center justify-between">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-200 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-lg">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 bg-gray-100 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 px-2 text-center text-sm font-semibold text-gray-700 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendar()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Who's Out Today ({todaysLeaves.length})
          </h3>
          {todaysLeaves.length > 0 ? (
            <div className="space-y-2">
              {todaysLeaves.map(leave => (
                <div key={leave.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{leave.employeeName}</div>
                    <div className="text-xs text-gray-500">{leave.department}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${leave.leaveColor}`}>
                      {leave.leaveTypeCode}
                    </div>
                    {leave.isHalfDay && <div className="text-xs text-gray-500 mt-1">{leave.session === 'morning' ? 'Morning' : 'Afternoon'} only</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Everyone is available today!</p>
          )}
        </div>

        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Upcoming Leaves (Next 7 Days)
          </h3>
          {upcomingLeaves.length > 0 ? (
            <div className="space-y-2">
              {upcomingLeaves.slice(0, 5).map(leave => (
                <div key={leave.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{leave.employeeName}</div>
                    <div className="text-xs text-gray-500">{leave.department}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${leave.leaveColor}`}>
                      {leave.leaveTypeCode}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(leave.fromDate).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming leaves in the next 7 days</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <h3 className="font-semibold text-gray-900 mb-3">Leave Type Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {leaveTypes.filter(t => t.code !== 'ALL').map(type => (
            <div key={type.code} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${type.color}`}></div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">{type.code}</span>
                <span className="text-gray-500 ml-1">- {type.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">
          <CalendarDays className="w-5 h-5 inline mr-2" />
          Team Calendar Features
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Visual monthly calendar showing all team member leaves at a glance</li>
          <li>✓ Color-coded leave types for quick identification and planning</li>
          <li>✓ "Who's Out Today" widget for daily resource availability check</li>
          <li>✓ Upcoming leaves view for proactive workload management</li>
          <li>✓ Department and leave type filters for focused team planning</li>
          <li>✓ Half-day leave indicators (AM/PM) for precise scheduling</li>
        </ul>
      </div>
    </div>
  );
}
