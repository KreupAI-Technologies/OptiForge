'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { HrTalentService } from '@/services/hr-talent.service';
import { TrendingUp, Target, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface KPI {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  weight: number;
  dueDate: string;
  status: 'on-track' | 'at-risk' | 'completed';
}

export default function KPITrackingPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.performanceGoals<any[]>();
        if (!cancelled) setKpis(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setKpis([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [updateValue, setUpdateValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50 border-green-200';
      case 'at-risk': return 'text-red-600 bg-red-50 border-red-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKPI) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const newValue = parseFloat(updateValue);
    const progress = calculateProgress(newValue, selectedKPI.targetValue);
    let status: KPI['status'] = 'on-track';
    if (progress >= 100) status = 'completed';
    else if (progress < 50) status = 'at-risk';

    try {
      await HrTalentService.updatePerformance(selectedKPI.id, {
        data: { currentValue: newValue, status },
        status
      });
      setKpis(prev => prev.map(k =>
        k.id === selectedKPI.id ? { ...k, currentValue: newValue, status } : k
      ));
      setSelectedKPI(null);
      setUpdateValue('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            KPI Tracking
          </h1>
          <p className="text-gray-500 mt-1">Monitor and update your performance goals.</p>
        </div>
      </div>

      <div className="grid gap-3">
        {kpis.map((kpi) => {
          const progress = calculateProgress(kpi.currentValue, kpi.targetValue);
          return (
            <div
              key={kpi.id}
              className="bg-white p-3 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{kpi.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(kpi.status)} capitalize`}>
                      {kpi.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{kpi.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Weight: {kpi.weight}%</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 justify-end mt-1">
                    <Calendar className="h-3 w-3" />
                    Due: {new Date(kpi.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900">{progress}% ({kpi.currentValue} / {kpi.targetValue} {kpi.unit})</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${kpi.status === 'completed' ? 'bg-blue-600' :
                        kpi.status === 'at-risk' ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedKPI(kpi);
                    setUpdateValue(kpi.currentValue.toString());
                  }}
                  className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  Update Progress
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Modal */}
      {selectedKPI && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Update Progress</h2>
              <button
                onClick={() => setSelectedKPI(null)}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-2">
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Value ({selectedKPI.unit})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={updateValue}
                    onChange={e => setUpdateValue(e.target.value)}
                  />
                  <span className="text-gray-500 font-medium whitespace-nowrap">
                    / {selectedKPI.targetValue}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="flex items-center gap-2 font-medium mb-1">
                  <Target className="h-4 w-4 text-purple-600" />
                  Target: {selectedKPI.targetValue} {selectedKPI.unit}
                </p>
                <p>Updating this value will automatically recalculate your progress percentage and status.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedKPI(null)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving…' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
