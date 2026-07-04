'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Search, Filter, Download, PlusCircle, Users, Clock, AlertTriangle, CheckCircle2, User, Briefcase } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

type ResourceEvent = {
  id: string;
  resourceId: string;
  resourceName: string;
  role: string;
  department: string;
  eventType: 'task' | 'meeting' | 'leave' | 'training' | 'maintenance' | 'other';
  title: string;
  projectCode: string;
  projectName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  durationHrs: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  billable: boolean;
  notes: string;
};

export default function ResourceCalendarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date('2025-10-27')); // Monday
  const [resourceEvents, setResourceEvents] = useState<ResourceEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const normType = (t: any): ResourceEvent['eventType'] => {
      const v = String(t ?? '').toLowerCase();
      if (['task', 'meeting', 'leave', 'training', 'maintenance', 'other'].includes(v)) return v as ResourceEvent['eventType'];
      return 'task';
    };
    const normStatus = (s: any): ResourceEvent['status'] => {
      const v = String(s ?? '').toLowerCase().replace(/\s/g, '-');
      if (['scheduled', 'in-progress', 'completed', 'cancelled'].includes(v)) return v as ResourceEvent['status'];
      return 'scheduled';
    };
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Resource allocations drive the calendar; each allocation becomes an event.
        const raw = await projectManagementService.getProjectsResourceAllocations();
        const mapped: ResourceEvent[] = (raw ?? []).map((a: any, i: number) => ({
          id: a.id ?? `EVT-${i}`,
          resourceId: a.resourceId ?? a.userId ?? '',
          resourceName: a.resourceName ?? a.userName ?? a.name ?? 'Unknown',
          role: a.role ?? '-',
          department: a.department ?? a.dept ?? '-',
          eventType: normType(a.eventType ?? a.type),
          title: a.title ?? a.activity ?? a.projectPhase ?? a.projectName ?? 'Allocation',
          projectCode: a.projectCode ?? '',
          projectName: a.projectName ?? '',
          startDate: (a.startDate ?? '').slice(0, 10),
          endDate: (a.endDate ?? a.startDate ?? '').slice(0, 10),
          startTime: a.startTime ?? '09:00',
          endTime: a.endTime ?? '17:00',
          durationHrs: Number(a.durationHrs ?? a.allocatedHours ?? 0),
          status: normStatus(a.status),
          location: a.location ?? '-',
          billable: a.billable ?? false,
          notes: a.notes ?? a.remarks ?? '',
        }));
        if (!cancelled) setResourceEvents(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load resource calendar');
          setResourceEvents([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const resources = useMemo(() => ['all', ...Array.from(new Set(resourceEvents.map(e => e.resourceName)))], [resourceEvents]);
  const eventTypes = ['all', 'task', 'meeting', 'leave', 'training', 'maintenance', 'other'];
  const departments = useMemo(() => ['all', ...Array.from(new Set(resourceEvents.map(e => e.department)))], [resourceEvents]);

  const filtered = useMemo(() => {
    return resourceEvents.filter(e => {
      const matchesSearch = [
        e.title,
        e.resourceName,
        e.projectName,
        e.projectCode,
        e.location,
        e.role
      ].some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesResource = resourceFilter === 'all' ? true : e.resourceName === resourceFilter;
      const matchesEventType = eventTypeFilter === 'all' ? true : e.eventType === eventTypeFilter;
      const matchesStatus = statusFilter === 'all' ? true : e.status === statusFilter;
      const matchesDept = departmentFilter === 'all' ? true : e.department === departmentFilter;
      return matchesSearch && matchesResource && matchesEventType && matchesStatus && matchesDept;
    });
  }, [resourceEvents, searchTerm, resourceFilter, eventTypeFilter, statusFilter, departmentFilter]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, ResourceEvent[]> = {};
    filtered.forEach(event => {
      if (!grouped[event.startDate]) {
        grouped[event.startDate] = [];
      }
      grouped[event.startDate].push(event);
    });
    return grouped;
  }, [filtered]);

  // Calculate week days
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeekStart]);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    const monday = new Date(today);
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diff);
    setCurrentWeekStart(monday);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-teal-600 border-teal-700';
      case 'meeting': return 'bg-indigo-600 border-indigo-700';
      case 'leave': return 'bg-gray-500 border-gray-600';
      case 'training': return 'bg-purple-600 border-purple-700';
      case 'maintenance': return 'bg-orange-600 border-orange-700';
      default: return 'bg-blue-600 border-blue-700';
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Calculate stats (derived from fetched data)
  const totalEvents = resourceEvents.length;
  const scheduledEvents = resourceEvents.filter(e => e.status === 'scheduled').length;
  const completedEvents = resourceEvents.filter(e => e.status === 'completed').length;
  const totalBillableHours = resourceEvents.filter(e => e.billable).reduce((sum, e) => sum + e.durationHrs, 0);
  const avgUtilization = totalEvents > 0 ? Math.round((totalBillableHours / (totalEvents * 8)) * 100) : 0;
  const activeResources = new Set(resourceEvents.map(e => e.resourceName)).size;

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-teal-600" />
          Resource Calendar
        </h1>
        <p className="text-gray-600 mt-2">Resource availability, scheduling, and allocation</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search events, resources, projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={goToToday}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar className="h-4 w-4" />
              Today
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button onClick={() => exportToCsv('resource-calendar', filtered)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <PlusCircle className="h-4 w-4" />
              Schedule Event
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalEvents}</p>
            </div>
            <Calendar className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Scheduled</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{scheduledEvents}</p>
            </div>
            <Clock className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{completedEvents}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Active Resources</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{activeResources}</p>
            </div>
            <Users className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Billable Hours</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{totalBillableHours}</p>
            </div>
            <Clock className="h-12 w-12 text-orange-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-sm font-medium">Avg Utilization</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1">{avgUtilization}%</p>
            </div>
            <Briefcase className="h-12 w-12 text-indigo-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filters</span>
          </div>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {resources.map(r => (
              <option key={r} value={r}>{r === 'all' ? 'All Resources' : r}</option>
            ))}
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>
            ))}
          </select>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {eventTypes.map(t => (
              <option key={t} value={t}>{t === 'all' ? 'All Event Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setResourceFilter('all');
              setEventTypeFilter('all');
              setStatusFilter('all');
              setDepartmentFilter('all');
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium"
            >
              ← Previous Week
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Week of {weekDays[0].toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <button
              onClick={goToNextWeek}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium"
            >
              Next Week →
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {isLoading ? 'Loading...' : loadError ? <span className="text-red-600">{loadError}</span> : `${filtered.length} events`}
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
            const date = weekDays[idx];
            const isToday = formatDate(date) === formatDate(new Date());
            return (
              <div key={day} className={`px-3 py-3 border-r last:border-r-0 border-gray-200 ${isToday ? 'bg-teal-50' : ''}`}>
                <div className="text-xs font-medium text-gray-600">{day}</div>
                <div className={`text-lg font-bold ${isToday ? 'text-teal-700' : 'text-gray-800'}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 min-h-[400px]">
          {weekDays.map((date, idx) => {
            const dateKey = formatDate(date);
            const dayEvents = eventsByDate[dateKey] || [];
            const isToday = dateKey === formatDate(new Date());

            return (
              <div
                key={idx}
                className={`border-r last:border-r-0 border-gray-200 p-2 ${isToday ? 'bg-teal-50/30' : 'bg-white'}`}
              >
                <div className="space-y-2">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-white ${getEventTypeColor(event.eventType)} rounded-md px-2 py-2 shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow`}
                    >
                      <div className="text-xs font-semibold leading-tight mb-1">
                        {event.startTime} - {event.endTime}
                      </div>
                      <div className="text-xs font-medium leading-tight mb-1">
                        {event.title}
                      </div>
                      <div className="text-[11px] opacity-90 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.resourceName}
                      </div>
                      <div className="text-[11px] opacity-90">
                        {event.durationHrs}h • {event.billable ? 'Billable' : 'Non-billable'}
                      </div>
                      {event.projectCode && (
                        <div className="text-[10px] opacity-75 mt-1">
                          {event.projectCode}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-4">
                      No events
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="font-medium text-gray-700">Event Types:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-600 rounded border-2 border-teal-700" />
            <span className="text-gray-700">Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-600 rounded border-2 border-indigo-700" />
            <span className="text-gray-700">Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded border-2 border-gray-600" />
            <span className="text-gray-700">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-600 rounded border-2 border-purple-700" />
            <span className="text-gray-700">Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-600 rounded border-2 border-orange-700" />
            <span className="text-gray-700">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          Resource Scheduling Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Schedule resources based on skills and availability</li>
              <li>Avoid back-to-back assignments without breaks</li>
              <li>Consider travel time between locations</li>
              <li>Plan for equipment and material availability</li>
              <li>Maintain 70-85% utilization for optimal performance</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Event Types:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Task: Project work, installations, assembly</li>
              <li>Meeting: Client meetings, reviews, presentations</li>
              <li>Leave: Planned leave, sick leave, holidays</li>
              <li>Training: Skill development, certifications</li>
              <li>Maintenance: Equipment maintenance, facility upkeep</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
