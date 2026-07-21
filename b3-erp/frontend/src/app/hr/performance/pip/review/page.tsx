'use client';

import { useState, useEffect } from 'react';
import { PerformanceManagementService } from '@/services/performance-management.service';
import { CheckCircle, AlertTriangle, FileText, XCircle, Clock } from 'lucide-react';
import DataTable from '@/components/DataTable';

interface PIPReview {
  id: string;
  employee: string;
  role: string;
  startDate: string;
  endDate: string;
  status: 'pending_review' | 'passed' | 'failed' | 'extended';
  outcome?: string;
}

/** Map a NestJS PIP row onto the review view model. */
function mapPipReview(r: any): PIPReview {
  // Treat 'active' PIPs as awaiting a review decision.
  const raw = String(r?.status ?? 'active');
  const status: PIPReview['status'] =
    raw === 'passed' || raw === 'failed' || raw === 'extended'
      ? raw
      : 'pending_review';
  return {
    id: String(r?.id ?? ''),
    employee: r?.employeeName ?? r?.employeeId ?? 'Unknown',
    role: r?.role ?? '',
    startDate: r?.startDate ?? '',
    endDate: r?.endDate ?? '',
    status,
    outcome: r?.reviewNotes ?? r?.outcome ?? undefined,
  };
}

export default function PIPReviewPage() {
  const [reviews, setReviews] = useState<PIPReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const { data } = await PerformanceManagementService.getPIPs();
        if (!cancelled) setReviews((data ?? []).map(mapPipReview));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setReviews([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [selectedReview, setSelectedReview] = useState<PIPReview | null>(null);
  const [decision, setDecision] = useState<{ type: string; notes: string }>({ type: 'passed', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await PerformanceManagementService.transitionPIP(
        selectedReview.id,
        decision.type,
        decision.notes,
      );
      setReviews(prev => prev.map(r =>
        r.id === selectedReview.id
          ? { ...r, status: decision.type as any, outcome: decision.notes }
          : r
      ));
      setSelectedReview(null);
      setDecision({ type: 'passed', notes: '' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to finalize review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'endDate',
      label: 'End Date',
      render: (v: string) => new Date(v).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${v === 'pending_review' ? 'bg-orange-100 text-orange-800' :
            v === 'passed' ? 'bg-green-100 text-green-800' :
              v === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
          }`}>
          {v.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: string, row: PIPReview) => (
        <button
          onClick={() => setSelectedReview(row)}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
        >
          {row.status === 'pending_review' ? 'Review' : 'View Details'}
        </button>
      )
    }
  ];

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            PIP Review
          </h1>
          <p className="text-gray-500 mt-1">Review and finalize Performance Improvement Plan outcomes.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={reviews} />
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">PIP Conclusion Review</h2>
                <p className="text-sm text-gray-500">{selectedReview.employee} - {selectedReview.role}</p>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Summary Section (Mock Data) */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Plan Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 block">Start Date</span>
                    <span className="font-medium text-gray-900">{new Date(selectedReview.startDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">End Date</span>
                    <span className="font-medium text-gray-900">{new Date(selectedReview.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedReview.status === 'pending_review' ? (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  {submitError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Final Decision</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setDecision({ ...decision, type: 'passed' })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${decision.type === 'passed'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-200'
                          }`}
                      >
                        <CheckCircle className="h-6 w-6 mb-2" />
                        <span className="font-medium block">Pass</span>
                        <span className="text-xs opacity-75">Objectives Met</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecision({ ...decision, type: 'extended' })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${decision.type === 'extended'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-orange-200'
                          }`}
                      >
                        <Clock className="h-6 w-6 mb-2" />
                        <span className="font-medium block">Extend</span>
                        <span className="text-xs opacity-75">More Time Needed</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecision({ ...decision, type: 'failed' })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${decision.type === 'failed'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-red-200'
                          }`}
                      >
                        <XCircle className="h-6 w-6 mb-2" />
                        <span className="font-medium block">Fail</span>
                        <span className="text-xs opacity-75">Objectives Not Met</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outcome Summary & Justification</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Provide detailed feedback on the final outcome..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={decision.notes}
                      onChange={e => setDecision({ ...decision, notes: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setSelectedReview(null)}
                      className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                    >
                      {isSubmitting ? 'Finalizing…' : 'Finalize Review'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <div className={`p-4 rounded-lg border ${selectedReview.status === 'passed' ? 'bg-green-50 border-green-200 text-green-800' :
                      selectedReview.status === 'failed' ? 'bg-red-50 border-red-200 text-red-800' :
                        'bg-orange-50 border-orange-200 text-orange-800'
                    }`}>
                    <h4 className="font-semibold mb-1 capitalize flex items-center gap-2">
                      {selectedReview.status === 'passed' && <CheckCircle className="h-5 w-5" />}
                      {selectedReview.status === 'failed' && <XCircle className="h-5 w-5" />}
                      {selectedReview.status === 'extended' && <Clock className="h-5 w-5" />}
                      Outcome: {selectedReview.status}
                    </h4>
                    <p className="text-sm opacity-90">{selectedReview.outcome}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
