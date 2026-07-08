'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star, AlertCircle, Loader2, Search } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface ReviewRating {
  id: string;
  reviewCode: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  status: string;
  selfRating: number | null;
  managerRating: number | null;
  finalRating: number | null;
}

const numOrNull = (v: unknown): number | null => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const ratingLabel = (r: number | null): string => {
  if (r == null) return '—';
  if (r >= 4.5) return 'Exceptional';
  if (r >= 3.5) return 'Exceeds';
  if (r >= 2.5) return 'Meets';
  if (r >= 1.5) return 'Needs Improvement';
  return 'Unsatisfactory';
};

function Stars({ value }: { value: number | null }) {
  if (value == null) return <span className="text-gray-400 text-sm">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-600">{value.toFixed(1)}</span>
    </span>
  );
}

export default function ReviewRatingPage() {
  const [reviews, setReviews] = useState<ReviewRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.performanceReviews<any[]>()) as any[];
        const mapped: ReviewRating[] = (raw ?? []).map((r, i) => ({
          id: String(r?.id ?? `${i}`),
          reviewCode: r?.reviewCode ?? r?.code ?? `REV-${i + 1}`,
          employeeName: r?.employeeName ?? r?.employee?.name ?? 'Unknown',
          employeeCode: r?.employeeCode ?? String(r?.employeeId ?? ''),
          department: r?.department ?? r?.departmentName ?? '—',
          designation: r?.designation ?? '—',
          status: String(r?.status ?? 'not_started'),
          selfRating: numOrNull(r?.selfRating),
          managerRating: numOrNull(r?.managerRating),
          finalRating: numOrNull(r?.finalRating ?? r?.overallRating ?? r?.rating),
        }));
        if (!cancelled) setReviews(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load reviews');
          setReviews([]);
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

  const stats = useMemo(() => {
    const rated = reviews.filter((r) => r.finalRating != null);
    const avg = rated.length > 0 ? rated.reduce((s, r) => s + (r.finalRating as number), 0) / rated.length : 0;
    return {
      total: reviews.length,
      rated: rated.length,
      pending: reviews.length - rated.length,
      avg,
    };
  }, [reviews]);

  const filtered = useMemo(
    () =>
      reviews.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          r.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
          r.reviewCode.toLowerCase().includes(search.toLowerCase()),
      ),
    [reviews, search],
  );

  return (
    <div className="p-6 space-y-4">
      <div className="mb-1">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Star className="h-8 w-8 text-purple-600" />
          Review Ratings
        </h1>
        <p className="text-gray-600 mt-2">Consolidated performance review ratings</p>
      </div>

      {!isLoading && !loadError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Rated</p>
            <p className="text-2xl font-bold text-green-600">{stats.rated}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Awaiting Rating</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Avg. Final Rating</p>
            <p className="text-2xl font-bold text-blue-600">{stats.avg > 0 ? stats.avg.toFixed(1) : '—'}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee or review code…"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading reviews…
          </div>
        ) : loadError ? (
          <div className="flex items-center gap-2 py-12 justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{loadError}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Star className="w-10 h-10 mb-2 text-gray-300" />
            <p>No reviews found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Self</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Final</th>
                  <th className="px-4 py-3">Rating Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.employeeName}</p>
                      <p className="text-xs text-gray-500">{r.employeeCode || r.reviewCode}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.department}</td>
                    <td className="px-4 py-3"><Stars value={r.selfRating} /></td>
                    <td className="px-4 py-3"><Stars value={r.managerRating} /></td>
                    <td className="px-4 py-3"><Stars value={r.finalRating} /></td>
                    <td className="px-4 py-3 text-gray-600">{ratingLabel(r.finalRating)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
