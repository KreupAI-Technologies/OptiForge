'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { Clock, CheckCircle, AlertTriangle, ChevronRight, Calculator, Calendar } from 'lucide-react';

interface PIP {
  id: string;
  employee: string;
  role: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'terminated';
  progress: number;
  actionItems: { id: string; text: string; completed: boolean }[];
}

export default function PIPTrackingPage() {
  const [activePIPs, setActivePIPs] = useState<PIP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.performanceReviews<any[]>();
        if (!cancelled) setActivePIPs(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setActivePIPs([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleActionItem = (pipId: string, itemId: string) => {
    setActivePIPs(prev => prev.map(pip => {
      if (pip.id !== pipId) return pip;

      const updatedItems = pip.actionItems.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      const newProgress = Math.round(
        (updatedItems.filter(i => i.completed).length / updatedItems.length) * 100
      );

      return { ...pip, actionItems: updatedItems, progress: newProgress };
    }));
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-8 w-8 text-purple-600" />
            PIP Tracking
          </h1>
          <p className="text-gray-500 mt-1">Monitor progress of active Performance Improvement Plans.</p>
        </div>
      </div>

      <div className="grid gap-3">
        {activePIPs.map((pip) => (
          <div key={pip.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pip.employee}</h3>
                    <p className="text-gray-500">{pip.role}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(pip.startDate).toLocaleDateString()} - {new Date(pip.endDate).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pip.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {pip.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700 mb-1">Overall Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${pip.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{pip.progress}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === pip.id ? null : pip.id)}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${expandedId === pip.id ? 'rotate-90' : ''
                      }`}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {expandedId === pip.id && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Action Items & Milestones</h4>
                  <div className="space-y-3">
                    {pip.actionItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${item.completed ? 'bg-green-50 border-green-100' : 'bg-white border-gray-200'
                          }`}
                      >
                        <button
                          onClick={() => toggleActionItem(pip.id, item.id)}
                          className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-colors ${item.completed
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'border-gray-300 hover:border-purple-500'
                            }`}
                        >
                          {item.completed && <CheckCircle className="h-3.5 w-3.5" />}
                        </button>
                        <span className={`text-sm ${item.completed ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {activePIPs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">No Active PIPs</h3>
            <p className="text-gray-500">There are currently no active performance improvement plans.</p>
          </div>
        )}
      </div>
    </div>
  );
}
