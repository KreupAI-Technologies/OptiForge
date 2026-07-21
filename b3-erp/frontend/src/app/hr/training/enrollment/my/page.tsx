'use client';

import { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, Clock, Award, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { HrPagesService } from '@/services/hr-pages.service';

interface MyTraining {
  id: string;
  programCode: string;
  programTitle: string;
  category: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  attendance: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  instructor: string;
  location?: string;
  mode: string;
  certification: boolean;
}

export default function MyTrainingsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [mockTrainings, setMockTrainings] = useState<MyTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.trainingEnrollments()) as any[];
        const validStatuses: MyTraining['status'][] = ['upcoming', 'ongoing', 'completed', 'cancelled'];
        const mapped: MyTraining[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: String(r.id ?? ''),
          programCode: r.programCode ?? '',
          programTitle: r.programTitle ?? '',
          category: r.category ?? '',
          startDate: r.startDate ?? '',
          endDate: r.endDate ?? '',
          duration: Number(r.duration ?? 0),
          progress: Number(r.progress ?? 0),
          attendance: Number(r.attendance ?? 0),
          status: validStatuses.includes(r.status) ? r.status : 'upcoming',
          instructor: r.instructor ?? '',
          location: r.location ?? undefined,
          mode: r.mode ?? '',
          certification: Boolean(r.certification),
        }));
        if (!cancelled) setMockTrainings(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load trainings');
          setMockTrainings([]);
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

  const filteredTrainings = mockTrainings.filter(training => {
    return selectedStatus === 'all' || training.status === selectedStatus;
  });

  const stats = {
    total: mockTrainings.length,
    ongoing: mockTrainings.filter(t => t.status === 'ongoing').length,
    completed: mockTrainings.filter(t => t.status === 'completed').length,
    upcoming: mockTrainings.filter(t => t.status === 'upcoming').length,
    totalHours: mockTrainings.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.duration, 0),
    certifications: mockTrainings.filter(t => t.status === 'completed' && t.certification).length
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      upcoming: 'Upcoming',
      ongoing: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status as keyof typeof labels];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const handleDownloadCertificate = (training: MyTraining) => {
    const completed = training.endDate
      ? new Date(training.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Certificate — ${training.programTitle}</title>
<style>body{font-family:Georgia,serif;text-align:center;padding:60px;color:#1f2937}
.frame{border:8px double #7c3aed;padding:48px;border-radius:12px}
h1{font-size:34px;color:#7c3aed;margin-bottom:8px}
h2{font-size:26px;margin:24px 0}
.meta{color:#6b7280;margin-top:24px;font-size:14px}</style></head>
<body><div class="frame">
<h1>Certificate of Completion</h1>
<p>This certifies successful completion of the training program</p>
<h2>${training.programTitle}</h2>
<p>Program Code: ${training.programCode || '—'} &bull; Category: ${training.category || '—'}</p>
<div class="meta">
<p>Duration: ${training.duration} hours${training.instructor ? ` &bull; Instructor: ${training.instructor}` : ''}</p>
<p>Completed on ${completed}</p>
</div></div></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${(training.programCode || training.programTitle || 'training').replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'programCode', label: 'Program', sortable: true,
      render: (v: string, row: MyTraining) => (
        <div>
          <div className="font-semibold text-gray-900">{row.programTitle}</div>
          <div className="text-xs text-gray-500">{v} • {row.category}</div>
        </div>
      )
    },
    { key: 'startDate', label: 'Duration', sortable: true,
      render: (v: string, row: MyTraining) => (
        <div className="text-sm text-gray-700">
          <div>{new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - </div>
          <div>{new Date(row.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      )
    },
    { key: 'duration', label: 'Hours', sortable: true,
      render: (v: number) => <div className="text-sm text-gray-700">{v}h</div>
    },
    { key: 'progress', label: 'Progress', sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
            <div className={`h-2 rounded-full ${getProgressColor(v)}`} style={{ width: `${v}%` }} />
          </div>
          <span className="text-sm font-semibold text-gray-900">{v}%</span>
        </div>
      )
    },
    { key: 'attendance', label: 'Attendance', sortable: true,
      render: (v: number) => <div className="text-sm text-gray-700">{v}%</div>
    },
    { key: 'instructor', label: 'Instructor', sortable: true,
      render: (v: string) => <div className="text-sm text-gray-700">{v}</div>
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {getStatusLabel(v)}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <User className="h-8 w-8 text-purple-600" />
          My Trainings
        </h1>
        <p className="text-gray-600 mt-2">Track your enrolled training programs and progress</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading trainings…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Trainings</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            </div>
            <BookOpen className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.ongoing}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Training Hours</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalHours}h</p>
            </div>
            <Clock className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certifications</p>
              <p className="text-2xl font-bold text-orange-600">{stats.certifications}</p>
            </div>
            <Award className="h-10 w-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Alert for ongoing trainings */}
      {stats.ongoing > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Active Trainings</h3>
              <p className="text-sm text-yellow-700">
                You have {stats.ongoing} training program(s) in progress. Keep up with your attendance and assignments!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Trainings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Enrolled Programs</h3>
        </div>
        <DataTable data={filteredTrainings} columns={columns} />
      </div>

      {/* Completed Certifications */}
      {stats.certifications > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Earned Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {mockTrainings
              .filter(t => t.status === 'completed' && t.certification)
              .map(training => (
                <div key={training.id} className="border-2 border-purple-200 rounded-lg p-3 bg-purple-50">
                  <div className="flex items-start gap-3">
                    <Award className="h-8 w-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{training.programTitle}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Completed: {new Date(training.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-600">Duration: {training.duration} hours</p>
                      <button
                        onClick={() => handleDownloadCertificate(training)}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Download Certificate →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Training Participation Guidelines</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Maintain at least 80% attendance to be eligible for certification</li>
          <li>• Complete all assignments and assessments within the deadline</li>
          <li>• Actively participate in classroom discussions and activities</li>
          <li>• For online trainings, ensure you complete all modules in sequence</li>
          <li>• Contact your instructor or HR if you face any challenges</li>
          <li>• Certificates are issued within 7 days of successful completion</li>
        </ul>
      </div>
    </div>
  );
}
