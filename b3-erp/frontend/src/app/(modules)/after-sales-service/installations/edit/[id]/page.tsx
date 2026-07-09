'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  InstallationService,
  InstallationJob,
  InstallationStatus,
  UpdateInstallationJobDto,
} from '@/services/installation.service';
import { Save, X, AlertCircle, Wrench } from 'lucide-react';

const STATUS_OPTIONS: InstallationStatus[] = [
  'scheduled',
  'in_progress',
  'completed',
  'handed_over',
  'cancelled',
];

export default function EditInstallationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<InstallationJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Editable fields
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState<InstallationStatus>('scheduled');
  const [scheduledDate, setScheduledDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [teamLeaderName, setTeamLeaderName] = useState('');
  const [installationProgress, setInstallationProgress] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [siteSurveyCompleted, setSiteSurveyCompleted] = useState(false);
  const [testingCompleted, setTestingCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await InstallationService.getInstallationJobById(String(params.id));
        if (cancelled) return;
        if (!data || typeof data !== 'object') {
          setError('Installation job not found.');
          setJob(null);
          return;
        }
        setJob(data);
        setCustomerName(data.customerName ?? '');
        setStatus(data.status ?? 'scheduled');
        setScheduledDate(data.scheduledDate ? String(data.scheduledDate).split('T')[0] : '');
        setEstimatedDuration(data.estimatedDuration != null ? String(data.estimatedDuration) : '');
        setSiteAddress(data.siteAddress ?? '');
        setTeamLeaderName(data.teamLeaderName ?? '');
        setInstallationProgress(
          data.installationProgress != null ? String(data.installationProgress) : '',
        );
        setOrderValue(data.orderValue != null ? String(data.orderValue) : '');
        setSiteSurveyCompleted(Boolean(data.siteSurveyCompleted));
        setTestingCompleted(Boolean(data.testingCompleted));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load installation job.');
          setJob(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const dto: UpdateInstallationJobDto = {
        customerName,
        status,
        scheduledDate,
        estimatedDuration: estimatedDuration === '' ? undefined : Number(estimatedDuration),
        siteAddress,
        teamLeaderName,
        installationProgress:
          installationProgress === '' ? undefined : Number(installationProgress),
        orderValue: orderValue === '' ? undefined : Number(orderValue),
        siteSurveyCompleted,
        testingCompleted,
      };
      await InstallationService.updateInstallationJob(String(params.id), dto);
      router.push('/after-sales-service/installations');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">Unable to load installation</h2>
            <p className="text-sm text-red-700 mt-1">{error || 'Installation job not found.'}</p>
            <button
              onClick={() => router.push('/after-sales-service/installations')}
              className="mt-3 px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Back to Installations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Edit Installation</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{job.jobNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <span className="text-sm text-red-700">{saveError}</span>
          </div>
        )}

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Installation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InstallationStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (hours)
              </label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Address</label>
              <input
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Leader</label>
              <input
                type="text"
                value={teamLeaderName}
                onChange={(e) => setTeamLeaderName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
              <input
                type="number"
                value={installationProgress}
                onChange={(e) => setInstallationProgress(e.target.value)}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Value (₹)</label>
              <input
                type="number"
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-6 md:col-span-2 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={siteSurveyCompleted}
                  onChange={(e) => setSiteSurveyCompleted(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Site survey completed</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={testingCompleted}
                  onChange={(e) => setTestingCompleted(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Testing completed</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
