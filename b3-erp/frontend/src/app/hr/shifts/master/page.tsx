'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, Sun, Moon, Sunrise, Sunset, Users, Coffee, CheckCircle, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { CreateShiftModal } from '@/components/hr/CreateShiftModal';
import { HrPagesService } from '@/services/hr-pages.service';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHIFT_TYPES = ['day', 'night', 'morning', 'evening', 'flexible', 'rotational'];

function normalizeShiftType(raw: string): Shift['type'] {
  const t = (raw || '').toLowerCase();
  if (SHIFT_TYPES.includes(t)) return t as Shift['type'];
  if (t.includes('night')) return 'night';
  if (t.includes('rotat')) return 'rotational';
  if (t.includes('flex') || t === 'general') return 'flexible';
  return 'day';
}

function trimTime(t?: string): string {
  if (!t) return '';
  const parts = t.split(':');
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : t;
}

function mapWorkingDays(raw: any): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((d) => {
    const n = Number(d);
    return Number.isFinite(n) && DAY_NAMES[n] ? DAY_NAMES[n] : String(d);
  });
}

interface Shift {
  id: string;
  name: string;
  code: string;
  type: 'day' | 'night' | 'morning' | 'evening' | 'flexible' | 'rotational';
  startTime: string;
  endTime: string;
  breakDuration: number;
  workingHours: number;
  gracePeriod: number;
  overtimeEligible: boolean;
  nightShiftAllowance: boolean;
  assignedEmployees: number;
  status: 'active' | 'inactive';
  daysApplicable: string[];
  createdDate: string;
}

export default function ShiftMasterPage() {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.shifts<any[]>();
        const mapped: Shift[] = (raw || []).map((s) => ({
          id: s.id,
          name: s.name ?? '',
          code: s.code ?? '',
          type: normalizeShiftType(s.type),
          startTime: trimTime(s.startTime),
          endTime: trimTime(s.endTime),
          breakDuration: Math.round(Number(s.breakHours ?? 0) * 60),
          workingHours: Number(s.workingHours ?? 0),
          gracePeriod: Number(s.graceMinutes ?? 0),
          overtimeEligible: Boolean(s.allowOvertime),
          nightShiftAllowance:
            Boolean(s.isNightShift) || Number(s.nightShiftAllowance ?? 0) > 0,
          assignedEmployees: Number(s.assignedEmployees ?? 0),
          status: (s.status ?? '').toLowerCase() === 'inactive' ? 'inactive' : 'active',
          daysApplicable: mapWorkingDays(s.workingDays),
          createdDate: s.createdAt ?? '',
        }));
        if (!cancelled) setShifts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load shifts');
          setShifts([]);
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

  const mockShifts: Shift[] = [
    {
      id: 'SH001', name: 'General Day Shift', code: 'GEN-DAY', type: 'day',
      startTime: '09:00', endTime: '18:00', breakDuration: 60, workingHours: 9, gracePeriod: 15,
      overtimeEligible: true, nightShiftAllowance: false, assignedEmployees: 65,
      status: 'active', daysApplicable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      createdDate: '2024-01-01'
    },
    {
      id: 'SH002', name: 'Night Shift', code: 'NIGHT', type: 'night',
      startTime: '22:00', endTime: '07:00', breakDuration: 60, workingHours: 9, gracePeriod: 10,
      overtimeEligible: true, nightShiftAllowance: true, assignedEmployees: 28,
      status: 'active', daysApplicable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      createdDate: '2024-01-01'
    },
    {
      id: 'SH003', name: 'Morning Shift', code: 'MORN', type: 'morning',
      startTime: '06:00', endTime: '15:00', breakDuration: 60, workingHours: 9, gracePeriod: 5,
      overtimeEligible: true, nightShiftAllowance: false, assignedEmployees: 42,
      status: 'active', daysApplicable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      createdDate: '2024-01-15'
    },
    {
      id: 'SH004', name: 'Evening Shift', code: 'EVE', type: 'evening',
      startTime: '15:00', endTime: '00:00', breakDuration: 60, workingHours: 9, gracePeriod: 10,
      overtimeEligible: true, nightShiftAllowance: true, assignedEmployees: 35,
      status: 'active', daysApplicable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      createdDate: '2024-01-15'
    },
    {
      id: 'SH005', name: 'Flexible Shift', code: 'FLEX', type: 'flexible',
      startTime: '08:00', endTime: '22:00', breakDuration: 60, workingHours: 9, gracePeriod: 0,
      overtimeEligible: false, nightShiftAllowance: false, assignedEmployees: 15,
      status: 'active', daysApplicable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      createdDate: '2024-02-01'
    },
    {
      id: 'SH006', name: 'Weekend Shift', code: 'WKND', type: 'day',
      startTime: '10:00', endTime: '19:00', breakDuration: 60, workingHours: 9, gracePeriod: 15,
      overtimeEligible: true, nightShiftAllowance: false, assignedEmployees: 8,
      status: 'active', daysApplicable: ['Saturday', 'Sunday'],
      createdDate: '2024-03-01'
    }
  ];

  const getTypeIcon = (type: string) => {
    const icons = {
      day: <Sun className="w-6 h-6 text-yellow-600" />,
      night: <Moon className="w-6 h-6 text-indigo-600" />,
      morning: <Sunrise className="w-6 h-6 text-orange-600" />,
      evening: <Sunset className="w-6 h-6 text-purple-600" />,
      flexible: <Clock className="w-6 h-6 text-blue-600" />,
      rotational: <Coffee className="w-6 h-6 text-green-600" />
    };
    return icons[type as keyof typeof icons] || <Clock className="w-6 h-6 text-gray-600" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      day: 'from-yellow-50 to-yellow-100 border-yellow-300',
      night: 'from-indigo-50 to-indigo-100 border-indigo-300',
      morning: 'from-orange-50 to-orange-100 border-orange-300',
      evening: 'from-purple-50 to-purple-100 border-purple-300',
      flexible: 'from-blue-50 to-blue-100 border-blue-300',
      rotational: 'from-green-50 to-green-100 border-green-300'
    };
    return colors[type as keyof typeof colors] || 'from-gray-50 to-gray-100 border-gray-300';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const stats = {
    total: shifts.length,
    active: shifts.filter(s => s.status === 'active').length,
    totalEmployees: shifts.reduce((sum, s) => sum + s.assignedEmployees, 0),
    withAllowance: shifts.filter(s => s.nightShiftAllowance).length
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="h-8 w-8 text-blue-600" />
          Shift Master
        </h1>
        <p className="text-gray-600 mt-2">Define and manage work shift templates</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading shifts…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Shifts</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Shifts</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assigned</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalEmployees}</p>
            </div>
            <Users className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Night Allowance</p>
              <p className="text-2xl font-bold text-purple-600">{stats.withAllowance}</p>
            </div>
            <Moon className="h-10 w-10 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">All Shift Templates</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New Shift
          </button>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className={`bg-gradient-to-br ${getTypeColor(shift.type)} rounded-lg shadow-sm border-2 p-3 hover:shadow-md transition-all`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getTypeIcon(shift.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{shift.name}</h3>
                  <p className="text-xs text-gray-600">{shift.code}</p>
                </div>
              </div>
              <StatusBadge status={shift.status} />
            </div>

            <div className="space-y-3 mb-2">
              <div className="flex justify-between items-center p-2 bg-white bg-opacity-50 rounded">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timing
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white bg-opacity-50 rounded">
                <span className="text-sm text-gray-700">Working Hours</span>
                <span className="text-sm font-semibold text-gray-900">{shift.workingHours}h</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white bg-opacity-50 rounded">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Assigned
                </span>
                <span className="text-sm font-semibold text-blue-700">{shift.assignedEmployees} employees</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {shift.overtimeEligible && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  OT Eligible
                </span>
              )}
              {shift.nightShiftAllowance && (
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  Night Allowance
                </span>
              )}
              {shift.gracePeriod > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {shift.gracePeriod}min Grace
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedShift(shift)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button className="px-3 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {getTypeIcon(selectedShift.type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedShift.name}</h2>
                    <p className="text-gray-600">{selectedShift.code} • {selectedShift.type.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedShift(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Start Time</p>
                  <p className="text-xl font-bold text-gray-900">{formatTime(selectedShift.startTime)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">End Time</p>
                  <p className="text-xl font-bold text-gray-900">{formatTime(selectedShift.endTime)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Working Hours</p>
                  <p className="text-xl font-bold text-blue-600">{selectedShift.workingHours} hours</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Break Duration</p>
                  <p className="text-xl font-bold text-gray-900">{selectedShift.breakDuration} mins</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicable Days</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedShift.daysApplicable.map(day => (
                    <span key={day} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shift Benefits & Policies</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {selectedShift.overtimeEligible ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-gray-400" />}
                    <span className="text-gray-900">Overtime Eligible</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {selectedShift.nightShiftAllowance ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-gray-400" />}
                    <span className="text-gray-900">Night Shift Allowance</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-900">Grace Period: {selectedShift.gracePeriod} minutes</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Assigned Employees</p>
                    <p className="text-2xl font-bold text-indigo-600">{selectedShift.assignedEmployees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <StatusBadge status={selectedShift.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Shift Modal */}
      <CreateShiftModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          const breakMinutes = Number(data.breakDuration ?? 0);
          try {
            const saved = await HrPagesService.createShift<any>({
              companyId: 'default-company-id',
              name: data.name,
              code: data.code,
              type: data.type,
              startTime: data.startTime,
              endTime: data.endTime,
              breakHours: breakMinutes / 60,
              workingHours: Number(data.workingHours ?? 0),
              graceMinutes: Number(data.gracePeriod ?? 0),
              allowOvertime: Boolean(data.overtimeEligible),
              isNightShift: Boolean(data.nightShiftAllowance),
              status: data.status ?? 'active',
              workingDays: (data.daysApplicable as string[]).map((d) => DAY_NAMES.indexOf(d)),
            });
            const created: Shift = {
              id: saved?.id ?? `SHIFT-${Date.now()}`,
              name: data.name,
              code: data.code,
              type: normalizeShiftType(data.type),
              startTime: trimTime(data.startTime),
              endTime: trimTime(data.endTime),
              breakDuration: breakMinutes,
              workingHours: Number(data.workingHours ?? 0),
              gracePeriod: Number(data.gracePeriod ?? 0),
              overtimeEligible: Boolean(data.overtimeEligible),
              nightShiftAllowance: Boolean(data.nightShiftAllowance),
              assignedEmployees: 0,
              status: (data.status ?? 'active') as Shift['status'],
              daysApplicable: data.daysApplicable as string[],
              createdDate: new Date().toISOString().split('T')[0],
            };
            setShifts((prev) => [...prev, created]);
            setIsCreateModalOpen(false);
          } catch (err) {
            setLoadError(err instanceof Error ? err.message : 'Failed to create shift');
          }
        }}
      />
    </div>
  );
}
