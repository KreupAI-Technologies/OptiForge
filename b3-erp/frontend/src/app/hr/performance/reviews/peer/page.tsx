'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { Users, Search, Filter, CheckCircle, Clock } from 'lucide-react';
import DataTable from '@/components/DataTable';

interface PeerReview {
  id: string;
  peerName: string;
  department: string;
  role: string;
  relationship: string;
  dueDate: string;
  status: 'pending' | 'completed';
  submittedDate?: string;
}

interface ReviewForm {
  teamwork: number;
  technical: number;
  communication: number;
  reliability: number;
  comments: string;
}

export default function PeerReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<PeerReview | null>(null);

  // Mock Data
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.performanceReviews<any[]>();
        if (!cancelled) setReviews(Array.isArray(rows) ? (rows as any) : []);
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

  const [formData, setFormData] = useState<ReviewForm>({
    teamwork: 0,
    technical: 0,
    communication: 0,
    reliability: 0,
    comments: ''
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    completed: reviews.filter(r => r.status === 'completed').length
  };

  const handleOpenReview = (peer: PeerReview) => {
    setSelectedPeer(peer);
    setFormData({
      teamwork: 0,
      technical: 0,
      communication: 0,
      reliability: 0,
      comments: ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeer) return;

    setReviews(prev => prev.map(r =>
      r.id === selectedPeer.id
        ? { ...r, status: 'completed', submittedDate: new Date().toISOString().split('T')[0] }
        : r
    ));

    setShowModal(false);
    setSelectedPeer(null);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.peerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || review.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: 'peerName',
      label: 'Peer',
      sortable: true,
      render: (value: string, row: PeerReview) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.role} • {row.department}</div>
        </div>
      )
    },
    { key: 'relationship', label: 'Relationship', sortable: true },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
          {value === 'completed' ? 'Completed' : 'Pending'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: PeerReview) => (
        row.status === 'pending' ? (
          <button
            onClick={() => handleOpenReview(row)}
            className="text-purple-600 hover:text-purple-900 font-medium text-sm"
          >
            Review
          </button>
        ) : (
          <span className="text-gray-400 text-sm">Submitted</span>
        )
      )
    }
  ];

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-purple-600" />
            Peer Reviews
          </h1>
          <p className="text-gray-500 mt-1">Provide feedback for your colleagues to help them grow.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search peers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={filteredReviews} />
      </div>

      {/* Review Modal */}
      {showModal && selectedPeer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Review for {selectedPeer.peerName}</h2>
                <p className="text-sm text-gray-500">{selectedPeer.role} • {selectedPeer.department}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 border-b pb-2">Competency Assessment</h3>

                {[
                  { key: 'teamwork', label: 'Teamwork & Collaboration' },
                  { key: 'technical', label: 'Technical Skills' },
                  { key: 'communication', label: 'Communication' },
                  { key: 'reliability', label: 'Reliability & Dependability' }
                ].map((metric) => (
                  <div key={metric.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-gray-700">{metric.label}</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, [metric.key]: star }))}
                          className={`text-2xl transition-colors ${star <= (formData as any)[metric.key] ? 'text-yellow-400' : 'text-gray-200'
                            } hover:text-yellow-400`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-900">Qualitative Feedback</label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Share specific examples of what this person does well and areas where they could improve..."
                  value={formData.comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
