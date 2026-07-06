'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Clock, AlertTriangle, Info } from 'lucide-react';
import { LogDowntimeModal, LogDowntimeData } from '@/components/production/downtime/DowntimeEventModals';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

export default function DowntimeLogPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    equipment: '',
    category: 'breakdown',
    severity: 'medium',
    startTime: '',
    description: '',
    affectedWO: '',
    estimatedDuration: '',
    reportedBy: '',
  });

  const equipmentList = [
    'CNC-CUT-01 - CNC Cutting Machine #1',
    'CNC-CUT-02 - CNC Cutting Machine #2',
    'LASER-CUT-02 - Laser Cutting Machine #2',
    'WELD-ST-01 - TIG Welding Station #1',
    'WELD-ST-02 - MIG Welding Station #2',
    'POLISH-01 - Polishing Machine #1',
    'PAINT-BOOTH-01 - Powder Coating Booth #1',
    'PRESS-HYDRO-01 - Hydraulic Press Machine',
    'ASSY-LINE-01 - Assembly Conveyor Line #1',
    'ASSY-LINE-02 - Assembly Conveyor Line #2',
    'FORK-LIFT-01 - Forklift #1',
    'FORK-LIFT-02 - Forklift #2',
    'FORK-LIFT-03 - Forklift #3',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ProductionOrphanService.createDowntimeRecord(formData);
      router.push('/production/downtime');
    } catch (error) {
      console.error('Failed to log downtime event:', error);
      alert('Failed to log downtime event. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleModalSubmit = async (data: LogDowntimeData) => {
    try {
      await ProductionOrphanService.createDowntimeRecord(data);
      setIsModalOpen(false);
      router.push('/production/downtime');
    } catch (error) {
      console.error('Failed to log downtime event:', error);
      alert('Failed to log downtime event. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
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
            <h1 className="text-2xl font-bold text-gray-900">Log Downtime Event</h1>
            <p className="text-sm text-gray-500 mt-1">Record a new production downtime incident</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="w-full mb-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> You can also log downtime events from the main Downtime Overview page using a quick modal dialog.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Try the modal version
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Please log downtime events as soon as they occur for accurate tracking and analysis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Equipment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment <span className="text-red-600">*</span>
              </label>
              <select
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select equipment...</option>
                {equipmentList.map((eq, idx) => (
                  <option key={idx} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

            {/* Category and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Downtime Category <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="breakdown">Breakdown</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="changeover">Changeover</option>
                  <option value="material-shortage">Material Shortage</option>
                  <option value="no-operator">No Operator</option>
                  <option value="power-outage">Power Outage</option>
                  <option value="quality-issue">Quality Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity <span className="text-red-600">*</span>
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="critical">Critical - Complete Production Stop</option>
                  <option value="high">High - Major Impact</option>
                  <option value="medium">Medium - Moderate Impact</option>
                  <option value="low">Low - Minor Impact</option>
                </select>
              </div>
            </div>

            {/* Start Time and Estimated Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe the downtime event, what happened, and any immediate actions taken..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Affected Work Orders */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affected Work Orders
              </label>
              <input
                type="text"
                name="affectedWO"
                value={formData.affectedWO}
                onChange={handleChange}
                placeholder="e.g., WO-2025-1135, WO-2025-1142 (comma separated)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Enter work order numbers separated by commas</p>
            </div>

            {/* Reported By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reported By <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>Log Downtime Event</span>
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Quick Tips for Logging Downtime
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Log the event as soon as it occurs for accurate time tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Provide detailed description including what failed, symptoms observed, and immediate actions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Select the correct severity based on production impact (Critical = complete stoppage)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Include all affected work orders to track production impact accurately</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Update the event with end time once the issue is resolved</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      <LogDowntimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
