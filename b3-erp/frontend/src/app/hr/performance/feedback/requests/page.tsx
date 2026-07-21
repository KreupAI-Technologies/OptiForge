'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { HrTalentService } from '@/services/hr-talent.service';
import { Mail, Plus, Clock, CheckCircle, User, Calendar } from 'lucide-react';
import DataTable from '@/components/DataTable';

interface FeedbackRequest {
  id: string;
  recipient: string;
  role: string;
  requestedDate: string;
  dueDate: string;
  status: 'pending' | 'completed';
  topics: string[];
}

export default function FeedbackRequestsPage() {
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState<FeedbackRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.performanceReviews<any[]>();
        if (!cancelled) setRequests(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setRequests([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [formData, setFormData] = useState({
    recipient: '',
    dueDate: '',
    message: '',
    topics: [] as string[]
  });

  const availableTopics = [
    'Technical Skills',
    'Communication',
    'Leadership',
    'Project Collaboration',
    'Problem Solving',
    'Innovation'
  ];

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    const payload = {
      recipient: formData.recipient,
      role: 'Team Member',
      requestedDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      message: formData.message,
      status: 'pending' as const,
      topics: formData.topics
    };
    try {
      const created = await HrTalentService.createPerformance<typeof payload>(payload, {
        recordType: 'feedback-request',
        status: 'pending'
      });
      const newRequest: FeedbackRequest = {
        id: String((created as any)?.id ?? Date.now().toString()),
        recipient: payload.recipient,
        role: payload.role,
        requestedDate: payload.requestedDate,
        dueDate: payload.dueDate,
        status: 'pending',
        topics: payload.topics
      };
      setRequests(prev => [newRequest, ...prev]);
      setShowModal(false);
      setFormData({
        recipient: '',
        dueDate: '',
        message: '',
        topics: []
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'recipient',
      label: 'Recipient',
      render: (value: string, row: FeedbackRequest) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
            {value.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{row.role}</div>
          </div>
        </div>
      )
    },
    {
      key: 'topics',
      label: 'Topics',
      render: (topics: string[]) => (
        <div className="flex flex-wrap gap-1">
          {topics.slice(0, 2).map((topic, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {topic}
            </span>
          ))}
          {topics.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{topics.length - 2} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
          {value === 'completed' ? 'Completed' : 'Pending'}
        </span>
      )
    }
  ];

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-8 w-8 text-purple-600" />
            Feedback Requests
          </h1>
          <p className="text-gray-500 mt-1">Manage feedback requests sent to colleagues.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Request Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pending Requests</p>
            <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'pending').length}</p>
          </div>
          <div className="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Completed Responses</p>
            <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'completed').length}</p>
          </div>
          <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={requests} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Request Feedback</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-2">
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Search colleague..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.recipient}
                    onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map(topic => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleTopicToggle(topic)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${formData.topics.includes(topic)
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Add a specific request or context..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending…' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
