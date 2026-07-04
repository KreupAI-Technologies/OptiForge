'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { Award, ThumbsUp, Heart, Star, Plus, User } from 'lucide-react';
import DataTable from '@/components/DataTable';

interface Recognition {
  id: string;
  sender: string;
  recipient: string;
  coreValue: string;
  message: string;
  date: string;
  reactions: number;
}

export default function RecognitionPage() {
  const [showModal, setShowModal] = useState(false);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.performanceReviews<any[]>();
        if (!cancelled) setRecognitions(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setRecognitions([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [formData, setFormData] = useState({
    recipient: '',
    coreValue: 'Teamwork',
    message: ''
  });

  const coreValues = [
    'Teamwork',
    'Innovation',
    'Excellence',
    'Customer Focus',
    'Integrity',
    'Ownership'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecognition: Recognition = {
      id: Date.now().toString(),
      sender: 'Current User', // Mock sender
      recipient: formData.recipient,
      coreValue: formData.coreValue,
      message: formData.message,
      date: new Date().toISOString().split('T')[0],
      reactions: 0
    };

    setRecognitions(prev => [newRecognition, ...prev]);
    setShowModal(false);
    setFormData({
      recipient: '',
      coreValue: 'Teamwork',
      message: ''
    });
  };

  const handleReaction = (id: string) => {
    setRecognitions(prev => prev.map(r =>
      r.id === id ? { ...r, reactions: r.reactions + 1 } : r
    ));
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-8 w-8 text-purple-600" />
            Recognition & Praise
          </h1>
          <p className="text-gray-500 mt-1">Celebrate wins and appreciate your colleagues.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Give Recognition
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Received This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Given This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Team Shoutouts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">45</p>
            </div>
            <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Recent Shoutouts</h2>
        <div className="grid gap-2">
          {recognitions.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                  {item.sender.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.sender} <span className="text-gray-400 font-normal">recognized</span> {item.recipient}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                          {item.coreValue}
                        </span>
                        <span className="text-xs text-gray-500">• {new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3 leading-relaxed">"{item.message}"</p>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleReaction(item.id)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{item.reactions}</span>
                    </button>
                    <button className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Give Recognition</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Who do you want to recognize?"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.recipient}
                    onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Core Value</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.coreValue}
                  onChange={e => setFormData({ ...formData, coreValue: e.target.value })}
                >
                  {coreValues.map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="What did they do? Be specific!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
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
                  Send Shoutout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
