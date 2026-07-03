'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Clock, Calendar, Users, Moon, Sun, Sunset, AlertTriangle } from 'lucide-react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface Shift {
  id: string;
  code: string;
  name: string;
  shiftType: 'day' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  duration: number;
  breakTime: number;
  workingDays: string[];
  effectiveFrom: string;
  effectiveTo: string;
  assignedWorkers: number;
  status: 'active' | 'inactive' | 'scheduled';
  allowOvertimeAfter: number;
  shiftPremium: number;
}

export default function ShiftsSettingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  // Shift definitions loaded from the NestJS backend (production/shift-definitions).
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw ORM shape (id/code/name/shiftType/startTime/endTime/
        // duration/breakTime/workingDays/effectiveFrom/effectiveTo/assignedWorkers/
        // status/allowOvertimeAfter/shiftPremium...).
        const raw = (await ProductionOrphanService.getShiftDefinitions()) as any[];
        const mapped: Shift[] = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => ({
          id: String(d?.id ?? i),
          code: d?.code ?? '',
          name: d?.name ?? '',
          shiftType: d?.shiftType ?? 'day',
          startTime: d?.startTime ?? '',
          endTime: d?.endTime ?? '',
          duration: Number(d?.duration ?? 0),
          breakTime: Number(d?.breakTime ?? 0),
          workingDays: Array.isArray(d?.workingDays) ? d.workingDays : [],
          effectiveFrom: d?.effectiveFrom ?? '',
          effectiveTo: d?.effectiveTo ?? '',
          assignedWorkers: Number(d?.assignedWorkers ?? 0),
          status: d?.status ?? 'active',
          allowOvertimeAfter: Number(d?.allowOvertimeAfter ?? 0),
          shiftPremium: Number(d?.shiftPremium ?? 0),
        }));
        if (!cancelled) setShifts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load shift definitions');
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

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shift.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || shift.shiftType === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getShiftIcon = (shiftType: string) => {
    switch (shiftType) {
      case 'day': return <Sun className="w-4 h-4" />;
      case 'evening': return <Sunset className="w-4 h-4" />;
      case 'night': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'day': return 'bg-yellow-100 text-yellow-700';
      case 'evening': return 'bg-orange-100 text-orange-700';
      case 'night': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading shifts…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && shifts.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No shifts found.
        </div>
      )}
      {/* Inline Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
            <p className="text-sm text-gray-500 mt-1">Configure and manage production shifts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Shifts</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{shifts.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Clock className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Shifts</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {shifts.filter(shift => shift.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Calendar className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Workers</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {shifts.filter(s => s.status === 'active').reduce((sum, shift) => sum + shift.assignedWorkers, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Users className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Shift Types</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {new Set(shifts.map(s => s.shiftType)).size}
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Sunset className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Shift Types</option>
            <option value="day">Day Shift</option>
            <option value="evening">Evening Shift</option>
            <option value="night">Night Shift</option>
          </select>
        </div>
      </div>

      {/* Shifts List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Break</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Days</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Workers</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Premium</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-bold text-gray-900">{shift.code}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{shift.name}</div>
                    <div className="text-xs text-gray-500">
                      Overtime after {shift.allowOvertimeAfter}h
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getShiftTypeColor(shift.shiftType)}`}>
                      {getShiftIcon(shift.shiftType)}
                      {shift.shiftType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {shift.startTime} - {shift.endTime}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-center">{shift.duration}h</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{shift.breakTime}m</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {shift.workingDays.map((day, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {day}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex items-center justify-center gap-1 font-semibold text-gray-900">
                      <Users className="w-3 h-3 text-gray-400" />
                      {shift.assignedWorkers}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {shift.shiftPremium > 0 ? (
                      <span className="font-bold text-green-600">+{shift.shiftPremium}%</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shift.status)}`}>
                      {shift.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredShifts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No shifts found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
