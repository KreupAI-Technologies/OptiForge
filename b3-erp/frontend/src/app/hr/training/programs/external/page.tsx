'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, DollarSign, Search, Book, AlertCircle } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import { TrainingDevelopmentService } from '@/services/training-development.service';

interface ExternalCourse {
  id: string;
  title: string;
  provider: string;
  duration: string;
  price: string;
}

export default function ExternalTrainingPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<ExternalCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<ExternalCourse | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ programName: '', externalVendor: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // Derive vendor list from fetched external courses (unique providers).
  const vendors = useMemo(() => {
    const byProvider = new Map<string, { count: number }>();
    courses.forEach((c) => {
      if (!c.provider) return;
      const v = byProvider.get(c.provider) ?? { count: 0 };
      v.count += 1;
      byProvider.set(c.provider, v);
    });
    return Array.from(byProvider.entries()).map(([name, v], idx) => ({
      id: String(idx + 1),
      name,
      courseCount: v.count,
    }));
  }, [courses]);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await HrPagesService.trainingPrograms()) as any[];
      const mapped: ExternalCourse[] = (Array.isArray(raw) ? raw : []).map((r) => ({
        id: String(r.id ?? ''),
        title: r.title ?? '',
        provider: r.provider ?? '',
        duration: r.duration ?? '',
        price: r.price ?? '',
      }));
      setCourses(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitRequest = async () => {
    if (!requestForm.programName) {
      setSubmitError('Please provide a program name.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);
    try {
      await TrainingDevelopmentService.createTrainingProgram({
        programName: requestForm.programName,
        externalVendor: requestForm.externalVendor || undefined,
        description: requestForm.description || undefined,
        isExternal: true,
      } as any);
      setSubmitMessage('External training request submitted for approval.');
      setRequestForm({ programName: '', externalVendor: '', description: '' });
      setShowRequest(false);
      await load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ExternalLink className="h-8 w-8 text-purple-600" />
            External Training
          </h1>
          <p className="text-gray-500 mt-1">Manage external vendors and training budget.</p>
        </div>
        <button
          onClick={() => router.push('/hr/training/budget/tracking')}
          className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
        >
          <div className="p-2 bg-green-100 rounded-full">
            <DollarSign className="h-5 w-5 text-green-700" />
          </div>
          <div className="text-left">
            <p className="text-xs text-green-600 font-medium">Training Budget</p>
            <p className="text-sm font-bold text-green-800">View budget tracking →</p>
          </div>
        </button>
      </div>

      {submitMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{submitMessage}</div>
      )}

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading courses…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Approved Vendors */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Training Providers</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium pl-4">Provider</th>
                    <th className="pb-3 font-medium">Courses Offered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-gray-500">No external providers found.</td>
                    </tr>
                  ) : (
                    vendors.map(vendor => (
                      <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 pl-4 font-medium text-gray-900">{vendor.name}</td>
                        <td className="py-4 text-gray-600 text-sm">{vendor.courseCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Featured Courses */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Book className="h-5 w-5 text-gray-400" />
              Popular Courses
            </h3>
            <div className="space-y-2">
              {courses.map(course => (
                <div key={course.id} className="p-4 border border-gray-100 rounded-lg hover:border-purple-200 hover:shadow-sm transition-all bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      {course.provider}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{course.price}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-500 mb-3">{course.duration}</p>
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full py-2 text-sm text-purple-700 font-medium bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Details
                  </button>
                </div>
              ))}
              {courses.length === 0 && !isLoading && (
                <p className="text-sm text-gray-500 text-center py-4">No courses available.</p>
              )}
            </div>
            <button
              onClick={() => router.push('/hr/training/programs/catalog')}
              className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Browse All Courses →
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-3 rounded-xl text-white">
            <h3 className="font-semibold text-lg mb-2">Propose New Vendor</h3>
            <p className="text-purple-100 text-sm mb-2">
              Need a specific training provider not listed here? Submit a request for approval.
            </p>
            <button
              onClick={() => { setSubmitError(null); setSubmitMessage(null); setShowRequest(true); }}
              className="px-4 py-2 bg-white text-purple-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>

      {/* Course details modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Course Details</h3>
              <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Title</dt><dd className="font-medium text-gray-900">{selectedCourse.title || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Provider</dt><dd className="font-medium text-gray-900">{selectedCourse.provider || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Duration</dt><dd className="font-medium text-gray-900">{selectedCourse.duration || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Price</dt><dd className="font-medium text-gray-900">{selectedCourse.price || '—'}</dd></div>
            </dl>
          </div>
        </div>
      )}

      {/* Submit request modal */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Propose External Training</h3>
            {submitError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                <input
                  type="text"
                  value={requestForm.programName}
                  onChange={(e) => setRequestForm({ ...requestForm, programName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor / Provider</label>
                <input
                  type="text"
                  value={requestForm.externalVendor}
                  onChange={(e) => setRequestForm({ ...requestForm, externalVendor: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
                <textarea
                  rows={3}
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowRequest(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={submitting || !requestForm.programName}
                className="px-4 py-2 rounded-lg bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
