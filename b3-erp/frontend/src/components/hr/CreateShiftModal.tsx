'use client';

import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle, CheckCircle, Sun, Moon, Sunrise, Sunset, Coffee, Users } from 'lucide-react';

interface CreateShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  /** When provided, the modal opens in edit mode prefilled with these values. */
  initialData?: Partial<{
    name: string;
    code: string;
    type: 'day' | 'night' | 'morning' | 'evening' | 'flexible' | 'rotational';
    startTime: string;
    endTime: string;
    breakDuration: string;
    workingHours: string;
    gracePeriod: string;
    overtimeEligible: boolean;
    nightShiftAllowance: boolean;
    daysApplicable: string[];
    status: 'active' | 'inactive';
  }>;
  title?: string;
  submitLabel?: string;
}

const emptyShiftForm = {
  name: '',
  code: '',
  type: 'day' as 'day' | 'night' | 'morning' | 'evening' | 'flexible' | 'rotational',
  startTime: '',
  endTime: '',
  breakDuration: '60',
  workingHours: '',
  gracePeriod: '15',
  overtimeEligible: true,
  nightShiftAllowance: false,
  daysApplicable: [] as string[],
  status: 'active' as 'active' | 'inactive'
};

export function CreateShiftModal({ isOpen, onClose, onSubmit, initialData, title, submitLabel }: CreateShiftModalProps) {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({ ...emptyShiftForm });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...emptyShiftForm, ...(initialData ?? {}) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form (create mode only; edit mode re-syncs from initialData on open)
    if (!isEdit) {
      setFormData({ ...emptyShiftForm });
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysApplicable: prev.daysApplicable.includes(day)
        ? prev.daysApplicable.filter(d => d !== day)
        : [...prev.daysApplicable, day]
    }));
  };

  const selectAllDays = () => {
    setFormData(prev => ({
      ...prev,
      daysApplicable: prev.daysApplicable.length === 7 ? [] : [...weekDays]
    }));
  };

  const selectWeekdays = () => {
    setFormData(prev => ({
      ...prev,
      daysApplicable: weekDays.slice(0, 5)
    }));
  };

  const calculateWorkingHours = () => {
    if (formData.startTime && formData.endTime && formData.breakDuration) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);

      let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

      // Handle overnight shifts
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
      }

      // Subtract break duration
      totalMinutes -= parseInt(formData.breakDuration);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return minutes > 0 ? `${hours}.${Math.round(minutes / 60 * 10)}` : hours.toString();
    }
    return '';
  };

  React.useEffect(() => {
    const hours = calculateWorkingHours();
    if (hours && hours !== formData.workingHours) {
      setFormData(prev => ({ ...prev, workingHours: hours }));
    }
  }, [formData.startTime, formData.endTime, formData.breakDuration]);

  const getTypeIcon = (type: string) => {
    const icons = {
      day: <Sun className="w-5 h-5" />,
      night: <Moon className="w-5 h-5" />,
      morning: <Sunrise className="w-5 h-5" />,
      evening: <Sunset className="w-5 h-5" />,
      flexible: <Clock className="w-5 h-5" />,
      rotational: <Coffee className="w-5 h-5" />
    };
    return icons[type as keyof typeof icons] || <Clock className="w-5 h-5" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      day: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      night: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      morning: 'bg-orange-100 text-orange-700 border-orange-300',
      evening: 'bg-purple-100 text-purple-700 border-purple-300',
      flexible: 'bg-blue-100 text-blue-700 border-blue-300',
      rotational: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-7 h-7 text-blue-600" />
                {title ?? 'Create New Shift Template'}
              </h2>
              <p className="text-gray-600 mt-1">Define a new shift schedule for employees</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shift Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., General Day Shift"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shift Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., GEN-DAY"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                />
              </div>
            </div>
          </div>

          {/* Shift Type */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">2</span>
              Shift Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['day', 'night', 'morning', 'evening', 'flexible', 'rotational'] as const).map((type) => (
                <label
                  key={type}
                  className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="sr-only"
                  />
                  {formData.type === type && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${getTypeColor(type)}`}>
                      {getTypeIcon(type)}
                    </div>
                    <span className="font-medium text-gray-900 capitalize">{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">3</span>
              Timing & Duration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.breakDuration}
                  onChange={(e) => setFormData({ ...formData, breakDuration: e.target.value })}
                  min="0"
                  step="15"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Hours (calculated)
                </label>
                <input
                  type="text"
                  value={formData.workingHours}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-calculated based on start/end time and break</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grace Period (minutes)
                </label>
                <input
                  type="number"
                  value={formData.gracePeriod}
                  onChange={(e) => setFormData({ ...formData, gracePeriod: e.target.value })}
                  min="0"
                  step="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Applicable Days */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">4</span>
              Applicable Days
            </h3>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={selectAllDays}
                className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {formData.daysApplicable.length === 7 ? 'Deselect All' : 'Select All'}
              </button>
              <button
                type="button"
                onClick={selectWeekdays}
                className="text-sm px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Weekdays Only (Mon-Fri)
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <label
                  key={day}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all text-center ${
                    formData.daysApplicable.includes(day)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.daysApplicable.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="sr-only"
                  />
                  <div className="text-sm font-medium text-gray-900">{day.slice(0, 3)}</div>
                  {formData.daysApplicable.includes(day) && (
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1" />
                  )}
                </label>
              ))}
            </div>
            {formData.daysApplicable.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Please select at least one day</p>
            )}
          </div>

          {/* Benefits & Policies */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">5</span>
              Benefits & Policies
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.overtimeEligible}
                  onChange={(e) => setFormData({ ...formData, overtimeEligible: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">Overtime Eligible</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Employees on this shift can claim overtime hours
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.nightShiftAllowance}
                  onChange={(e) => setFormData({ ...formData, nightShiftAllowance: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">Night Shift Allowance</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Employees receive additional allowance for night shifts
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          {formData.name && formData.startTime && formData.endTime && formData.daysApplicable.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 mb-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Shift Summary</h4>
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">{formData.name}</span> ({formData.code || 'Code required'}) •{' '}
                    <span className="capitalize">{formData.type}</span> shift •{' '}
                    {formData.startTime} - {formData.endTime} •{' '}
                    {formData.workingHours || '0'}h working •{' '}
                    {formData.daysApplicable.length} days/week
                    {formData.overtimeEligible && ' • OT Eligible'}
                    {formData.nightShiftAllowance && ' • Night Allowance'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || !formData.code || !formData.startTime || !formData.endTime || formData.daysApplicable.length === 0}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {submitLabel ?? 'Create Shift Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
