'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Users,
  Eye,
  X,
  Clock,
  Wrench,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  MapPin
} from 'lucide-react';
import { AfterSalesManagementService } from '@/services/after-sales-management.service';

interface Installation {
  id: string;
  jobNumber: string;
  customerName: string;
  time: string;
  duration: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  teamLead: string;
  equipmentCount: number;
}

export default function InstallationCalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1)); // February 2025
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedEngineer, setSelectedEngineer] = useState('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showInstallationModal, setShowInstallationModal] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);

  const [installations, setInstallations] = useState<Record<string, Installation[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const mapStatus = (s: string): Installation['status'] => {
      switch ((s || '').toLowerCase()) {
        case 'in_progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'scheduled':
        case 'pending':
        case 'rescheduled':
        default: return 'Scheduled';
      }
    };

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesManagementService.getInstallationsLive()) as any[];
        const list = Array.isArray(raw) ? raw : [];
        const grouped: Record<string, Installation[]> = {};
        list.forEach((r, idx) => {
          const scheduled = r?.scheduledDate ? new Date(r.scheduledDate) : null;
          if (!scheduled || isNaN(scheduled.getTime())) return;
          const dateKey = `${scheduled.getFullYear()}-${String(scheduled.getMonth() + 1).padStart(2, '0')}-${String(scheduled.getDate()).padStart(2, '0')}`;
          const inst: Installation = {
            id: r?.id ? String(r.id) : `${idx + 1}`,
            jobNumber: r?.installationNumber ?? r?.installationCode ?? '',
            customerName: r?.customerName ?? '',
            time: r?.scheduledTimeSlot ?? '',
            duration: Number(r?.estimatedDuration ?? r?.supportPeriod ?? 0),
            status: mapStatus(r?.status),
            teamLead: r?.teamLeaderName ?? r?.teamLeaderId ?? '',
            equipmentCount: Number(r?.equipmentQuantity ?? r?.totalItems ?? 0),
          };
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(inst);
        });
        if (!cancelled) setInstallations(grouped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load installations');
          setInstallations({});
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

  const engineers = ['All', 'Rajesh Kumar', 'Amit Patel', 'Priya Singh', 'Suresh Reddy', 'Neha Sharma'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getInstallationsForDay = (day: number) => {
    const dateKey = getDateKey(day);
    const dayInstallations = installations[dateKey] || [];

    if (selectedEngineer === 'All') {
      return dayInstallations;
    }
    return dayInstallations.filter(inst => inst.teamLead === selectedEngineer);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Completed': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // Statistics
  const totalInstallations = Object.values(installations).flat().length;
  const scheduledCount = Object.values(installations).flat().filter(i => i.status === 'Scheduled').length;
  const inProgressCount = Object.values(installations).flat().filter(i => i.status === 'In Progress').length;
  const completedCount = Object.values(installations).flat().filter(i => i.status === 'Completed').length;

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Installation Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule and manage installation jobs</p>
        </div>
        <button
          onClick={() => router.push('/after-sales-service/installations/add')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Schedule Installation
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Installations</span>
            <CalendarIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalInstallations}</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Scheduled</span>
            <CalendarIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{scheduledCount}</div>
          <div className="text-xs text-gray-500 mt-1">Upcoming jobs</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">In Progress</span>
            <Users className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
          <div className="text-xs text-gray-500 mt-1">Active today</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Completed</span>
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading installations…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          {loadError}
        </div>
      )}

      {/* Calendar Controls */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
              aria-label="Previous"
             
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
              {getMonthName(currentDate)}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
              aria-label="Next"
             
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedEngineer}
                onChange={(e) => setSelectedEngineer(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {engineers.map(eng => (
                  <option key={eng} value={eng}>{eng}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="min-h-[120px] p-2 border-b border-r border-gray-200 bg-gray-50" />
          ))}

          {/* Actual days */}
          {daysArray.map(day => {
            const dayInstallations = getInstallationsForDay(day);
            const hasInstallations = dayInstallations.length > 0;

            return (
              <div
                key={day}
                className={`min-h-[120px] p-2 border-b border-r border-gray-200 ${
                  isToday(day) ? 'bg-blue-50' : 'bg-white'
                } hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isToday(day) ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {day}
                  </span>
                  {hasInstallations && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {dayInstallations.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayInstallations.slice(0, 2).map(inst => (
                    <div
                      key={inst.id}
                      onClick={() => router.push(`/after-sales-service/installations/view/${inst.id}`)}
                      className={`p-1.5 rounded border cursor-pointer hover:shadow-sm transition-shadow ${getStatusColor(inst.status)}`}
                    >
                      <div className="text-xs font-medium truncate">{inst.time}</div>
                      <div className="text-xs truncate">{inst.customerName}</div>
                    </div>
                  ))}
                  {dayInstallations.length > 2 && (
                    <div className="text-xs text-gray-600 text-center py-1">
                      +{dayInstallations.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Status Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
            <span className="text-xs text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
            <span className="text-xs text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
            <span className="text-xs text-gray-600">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
