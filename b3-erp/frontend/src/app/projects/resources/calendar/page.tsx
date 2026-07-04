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

const RESOURCE_EVENTS: ResourceEvent[] = [
  {
    id: 'EVT-001',
    resourceId: 'RES-101',
    resourceName: 'Sara Ali',
    role: 'Installer',
    department: 'Installation',
    eventType: 'task',
    title: 'Cabinet Installation - Tower A Unit 1502',
    projectCode: 'KF-A',
    projectName: 'Kitchen Fitout - Tower A',
    startDate: '2025-10-28',
    endDate: '2025-10-28',
    startTime: '09:00',
    endTime: '15:00',
    durationHrs: 6,
    status: 'scheduled',
    location: 'Mumbai - Tower A',
    billable: true,
    notes: 'Client prefers morning slot. Access card arranged.'
  },
  {
    id: 'EVT-002',
    resourceId: 'RES-102',
    resourceName: 'Priya Patel',
    role: 'Designer',
    department: 'Design',
    eventType: 'meeting',
    title: 'Design Review Meeting - Luxury Villa',
    projectCode: 'LVW-09',
    projectName: 'Luxury Villa Wardrobes',
    startDate: '2025-10-28',
    endDate: '2025-10-28',
    startTime: '11:00',
    endTime: '13:00',
    durationHrs: 2,
    status: 'scheduled',
    location: 'Conference Room A',
    billable: true,
    notes: 'Client will present mood board.'
  },
  {
    id: 'EVT-003',
    resourceId: 'RES-103',
    resourceName: 'Rahul Kumar',
    role: 'Project Manager',
    department: 'Projects',
    eventType: 'task',
    title: 'Site Survey - Corporate Pantry',
    projectCode: 'CPR-12',
    projectName: 'Corporate Pantry Rollout',
    startDate: '2025-10-29',
    endDate: '2025-10-29',
    startTime: '10:00',
    endTime: '14:00',
    durationHrs: 4,
    status: 'scheduled',
    location: 'Pune - Corporate Office',
    billable: true,
    notes: 'Take measurements and photos.'
  },
  {
    id: 'EVT-004',
    resourceId: 'RES-104',
    resourceName: 'Amit Singh',
    role: 'Project Manager',
    department: 'Projects',
    eventType: 'meeting',
    title: 'Client Handover Meeting',
    projectCode: 'SR-08',
    projectName: 'Showroom Refurbishment',
    startDate: '2025-10-30',
    endDate: '2025-10-30',
    startTime: '16:00',
    endTime: '17:30',
    durationHrs: 1.5,
    status: 'scheduled',
    location: 'Showroom',
    billable: false,
    notes: 'Final walkthrough with client.'
  },
  {
    id: 'EVT-005',
    resourceId: 'RES-105',
    resourceName: 'Vikram Reddy',
    role: 'Assembler',
    department: 'Production',
    eventType: 'task',
    title: 'Wardrobe Assembly - Premium Units',
    projectCode: 'LVW-09',
    projectName: 'Luxury Villa Wardrobes',
    startDate: '2025-10-31',
    endDate: '2025-10-31',
    startTime: '08:00',
    endTime: '17:00',
    durationHrs: 8,
    status: 'scheduled',
    location: 'Factory - Assembly Bay 3',
    billable: true,
    notes: 'Premium finish required. QC inspection at 16:00.'
  },
  {
    id: 'EVT-006',
    resourceId: 'RES-101',
    resourceName: 'Sara Ali',
    role: 'Installer',
    department: 'Installation',
    eventType: 'leave',
    title: 'Planned Leave',
    projectCode: '',
    projectName: '',
    startDate: '2025-11-01',
    endDate: '2025-11-01',
    startTime: '00:00',
    endTime: '23:59',
    durationHrs: 8,
    status: 'scheduled',
    location: 'N/A',
    billable: false,
    notes: 'Personal leave approved.'
  },
  {
    id: 'EVT-007',
    resourceId: 'RES-106',
    resourceName: 'Karthik Iyer',
    role: 'Electrician',
    department: 'Installation',
    eventType: 'task',
    title: 'Electrical Wiring - Under Cabinet Lighting',
    projectCode: 'KF-A',
    projectName: 'Kitchen Fitout - Tower A',
    startDate: '2025-10-28',
    endDate: '2025-10-28',
    startTime: '14:00',
    endTime: '18:00',
    durationHrs: 4,
    status: 'scheduled',
    location: 'Mumbai - Tower A',
    billable: true,
    notes: 'Coordinate with Sara for cabinet work completion.'
  },
  {
    id: 'EVT-008',
    resourceId: 'RES-107',
    resourceName: 'Neha Gupta',
    role: 'Procurement Officer',
    department: 'Procurement',
    eventType: 'meeting',
    title: 'Vendor Meeting - Hardware Suppliers',
    projectCode: 'LVW-09',
    projectName: 'Luxury Villa Wardrobes',
    startDate: '2025-10-29',
    endDate: '2025-10-29',
    startTime: '15:00',
    endTime: '16:30',
    durationHrs: 1.5,
    status: 'scheduled',
    location: 'Virtual - Teams',
    billable: false,
    notes: 'Negotiate bulk pricing for premium hinges.'
  },
  {
    id: 'EVT-009',
    resourceId: 'RES-108',
    resourceName: 'Deepak Singh',
    role: 'Finisher',
    department: 'Production',
    eventType: 'task',
    title: 'Final Finishing & Polishing',
    projectCode: 'SR-08',
    projectName: 'Showroom Refurbishment',
    startDate: '2025-10-30',
    endDate: '2025-10-30',
    startTime: '09:00',
    endTime: '16:00',
    durationHrs: 7,
    status: 'scheduled',
    location: 'Showroom - Display Area',
    billable: true,
    notes: 'Premium finish. Client inspection at 17:00.'
  },
  {
    id: 'EVT-010',
    resourceId: 'RES-102',
    resourceName: 'Priya Patel',
    role: 'Designer',
    department: 'Design',
    eventType: 'training',
    title: '3D Design Software Training',
    projectCode: '',
    projectName: '',
    startDate: '2025-10-31',
    endDate: '2025-10-31',
    startTime: '10:00',
    endTime: '13:00',
    durationHrs: 3,
    status: 'scheduled',
    location: 'Training Room',
    billable: false,
    notes: 'SketchUp advanced features training.'
  },
  {
    id: 'EVT-011',
    resourceId: 'RES-109',
    resourceName: 'Arjun Nair',
    role: 'Site Engineer',
    department: 'Engineering',
    eventType: 'task',
    title: 'Site Measurements & Structural Assessment',
    projectCode: 'CPR-12',
    projectName: 'Corporate Pantry Rollout',
    startDate: '2025-10-28',
    endDate: '2025-10-28',
    startTime: '09:00',
    endTime: '12:00',
    durationHrs: 3,
    status: 'completed',
    location: 'Pune - Corporate Office',
    billable: true,
    notes: 'Measurements completed. Report submitted.'
  },
  {
    id: 'EVT-012',
    resourceId: 'RES-110',
    resourceName: 'Meera Kapoor',
    role: 'Project Coordinator',
    department: 'Projects',
    eventType: 'task',
    title: 'Project Documentation & Compliance Check',
    projectCode: 'KF-A',
    projectName: 'Kitchen Fitout - Tower A',
    startDate: '2025-10-29',
    endDate: '2025-10-29',
    startTime: '11:00',
    endTime: '14:00',
    durationHrs: 3,
    status: 'scheduled',
    location: 'Office',
    billable: false,
    notes: 'Verify all permits and certifications.'
  },
  {
    id: 'EVT-013',
    resourceId: 'RES-103',
    resourceName: 'Rahul Kumar',
    role: 'Project Manager',
    department: 'Projects',
    eventType: 'meeting',
    title: 'Stakeholder Status Update',
    projectCode: 'CPR-12',
    projectName: 'Corporate Pantry Rollout',
    startDate: '2025-10-31',
    endDate: '2025-10-31',
    startTime: '15:00',
    endTime: '16:00',
    durationHrs: 1,
    status: 'scheduled',
    location: 'Virtual - Zoom',
    billable: true,
    notes: 'Present progress report and timeline updates.'
  },
  {
    id: 'EVT-014',
    resourceId: 'RES-111',
    resourceName: 'Anjali Sharma',
    role: 'QC Inspector',
    department: 'Quality',
    eventType: 'task',
    title: 'Quality Inspection - Showroom Units',
    projectCode: 'SR-08',
    projectName: 'Showroom Refurbishment',
    startDate: '2025-10-30',
    endDate: '2025-10-30',
    startTime: '13:00',
    endTime: '15:00',
    durationHrs: 2,
    status: 'scheduled',
    location: 'Showroom',
    billable: false,
    notes: 'Final QC before client handover.'
  },
  {
    id: 'EVT-015',
    resourceId: 'RES-104',
    resourceName: 'Amit Singh',
    role: 'Project Manager',
    department: 'Projects',
    eventType: 'task',
    title: 'Risk Assessment & Mitigation Planning',
    projectCode: 'LVW-09',
    projectName: 'Luxury Villa Wardrobes',
    startDate: '2025-10-28',
    endDate: '2025-10-28',
    startTime: '10:00',
    endTime: '12:00',
    durationHrs: 2,
    status: 'completed',
    location: 'Office',
    billable: false,
    notes: 'Identified 3 medium-risk items. Mitigation plan ready.'
  }
];

export default function ResourceCalendarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date('2025-10-27')); // Monday

  const resources = useMemo(() => ['all', ...Array.from(new Set(RESOURCE_EVENTS.map(e => e.resourceName)))], []);
  const eventTypes = ['all', 'task', 'meeting', 'leave', 'training', 'maintenance', 'other'];
  const departments = useMemo(() => ['all', ...Array.from(new Set(RESOURCE_EVENTS.map(e => e.department)))], []);

  const filtered = useMemo(() => {
    return RESOURCE_EVENTS.filter(e => {
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
  }, [searchTerm, resourceFilter, eventTypeFilter, statusFilter, departmentFilter]);

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

  // Calculate stats
  const totalEvents = RESOURCE_EVENTS.length;
  const scheduledEvents = RESOURCE_EVENTS.filter(e => e.status === 'scheduled').length;
  const completedEvents = RESOURCE_EVENTS.filter(e => e.status === 'completed').length;
  const totalBillableHours = RESOURCE_EVENTS.filter(e => e.billable).reduce((sum, e) => sum + e.durationHrs, 0);
  const avgUtilization = Math.round((totalBillableHours / (totalEvents * 8)) * 100);
  const activeResources = new Set(RESOURCE_EVENTS.map(e => e.resourceName)).size;

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
            {filtered.length} events
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
