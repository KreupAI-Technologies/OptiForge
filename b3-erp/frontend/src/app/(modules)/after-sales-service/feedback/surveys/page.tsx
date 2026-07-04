'use client';

import { useState, useMemo, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { ClipboardList, Search, Plus, Send, Eye, Download, Filter, Calendar, User, TrendingUp, MessageSquare, BarChart3, CheckCircle, Clock, X, Target, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Survey {
  id: string;
  title: string;
  description: string;
  type: 'customer' | 'technician' | 'installation';
  category: string;
  status: 'active' | 'draft' | 'closed';
  startDate: string;
  endDate: string;
  responses: number;
  responseRate: number;
  questions: number;
  createdBy: string;
  averageCompletionTime: number; // in minutes
  featured: boolean;
}

// Defensive mapper: backend feedback row -> page Survey model.
function mapSurvey(r: any): Survey {
  return {
    id: String(r?.id ?? r?.reference ?? ''),
    title: r?.title ?? r?.subject ?? '',
    description: r?.description ?? '',
    type: (r?.type ?? 'customer') as Survey['type'],
    category: r?.category ?? 'General',
    status: (r?.status ?? 'draft') as Survey['status'],
    startDate: r?.startDate ?? '',
    endDate: r?.endDate ?? '',
    responses: Number(r?.responses ?? 0),
    responseRate: Number(r?.responseRate ?? 0),
    questions: Number(r?.questions ?? 0),
    createdBy: r?.createdBy ?? '',
    averageCompletionTime: Number(r?.averageCompletionTime ?? 0),
    featured: Boolean(r?.featured ?? false),
  };
}

export default function SurveysPage() {
  const [mockSurveys, setMockSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.surveys()) as any[];
        if (!cancelled) setMockSurveys(Array.isArray(raw) ? raw.map(mapSurvey) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load surveys');
          setMockSurveys([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [sortBy, setSortBy] = useState<'responses' | 'recent' | 'responseRate'>('responses');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const categories = ['Service Quality', 'Technician', 'Installation', 'Product Quality', 'Internal', 'Warranty', 'Support', 'Parts'];
  const types = ['customer', 'technician', 'installation'];

  const filteredSurveys = useMemo(() => {
    let filtered = mockSurveys.filter(survey => {
      const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || survey.category === selectedCategory;
      const matchesType = selectedType === 'all' || survey.type === selectedType;
      const matchesStatus = survey.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });

    // Sort
    if (sortBy === 'responses') {
      filtered.sort((a, b) => b.responses - a.responses);
    } else if (sortBy === 'responseRate') {
      filtered.sort((a, b) => b.responseRate - a.responseRate);
    } else {
      filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedType, selectedStatus, sortBy]);

  const stats = {
    total: mockSurveys.length,
    active: mockSurveys.filter(s => s.status === 'active').length,
    totalResponses: mockSurveys.reduce((sum, s) => sum + s.responses, 0),
    avgResponseRate: (mockSurveys.filter(s => s.responses > 0).reduce((sum, s) => sum + s.responseRate, 0) / mockSurveys.filter(s => s.responses > 0).length).toFixed(0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-700';
      case 'technician': return 'bg-purple-100 text-purple-700';
      case 'installation': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewDetails = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowDetailsModal(true);
  };

  const handleViewAnalytics = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowAnalyticsModal(true);
  };

  const handleDownload = (survey: Survey) => {
    toast({
      title: "Download Started",
      description: `Downloading survey responses for "${survey.title}"`,
    });
  };

  const handleCreateSurvey = () => {
    toast({
      title: "Create Survey",
      description: "Survey creation form will open here.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-emerald-600" />
            Customer Surveys
          </h1>
          <p className="text-gray-600 mt-1">Create and manage feedback surveys</p>
        </div>
        <button onClick={handleCreateSurvey} className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md">
          <Plus className="h-5 w-5" />
          Create Survey
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <button onClick={() => setSelectedStatus('active')} className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:border-blue-500 hover:shadow-lg transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Surveys</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              <p className="text-xs text-blue-600 mt-2">Click to view all</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button onClick={() => setSelectedStatus('active')} className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:border-green-500 hover:shadow-lg transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              <p className="text-xs text-green-600 mt-2">Click to filter</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalResponses.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Rate</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.avgResponseRate}%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="all">All Types</option>
                <option value="customer">Customer</option>
                <option value="technician">Technician</option>
                <option value="installation">Installation</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="responses">Most Responses</option>
                <option value="responseRate">Highest Response Rate</option>
                <option value="recent">Recently Created</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="space-y-2">
        {filteredSurveys.map((survey) => (
          <div key={survey.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{survey.title}</h3>
                  {survey.featured && (
                    <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">Featured</span>
                  )}
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(survey.status)}`}>
                    {survey.status.toUpperCase()}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(survey.type)}`}>
                    {survey.type.charAt(0).toUpperCase() + survey.type.slice(1)}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{survey.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Questions</p>
                    <p className="text-lg font-semibold text-gray-900">{survey.questions}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Responses</p>
                    <p className="text-lg font-semibold text-blue-600">{survey.responses}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Response Rate</p>
                    <p className="text-lg font-semibold text-green-600">{survey.responseRate}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">{survey.averageCompletionTime} min</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Category</p>
                    <p className="text-sm font-semibold text-gray-900">{survey.category}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Created By</p>
                    <p className="text-sm font-semibold text-gray-900">{survey.createdBy.split(' ')[0]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(survey.startDate).toLocaleDateString('en-IN')} - {new Date(survey.endDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-6">
                <button
                  onClick={() => handleViewDetails(survey)}
                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                  aria-label="View Details"
                  title="View Details"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleViewAnalytics(survey)}
                  className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600 hover:text-emerald-700"
                  aria-label="View Analytics"
                  title="View Analytics"
                >
                  <BarChart3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDownload(survey)}
                  className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-600 hover:text-orange-700"
                  aria-label="Download"
                  title="Download Responses"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredSurveys.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <ClipboardList className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-600 font-medium">No surveys found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Survey Details Modal */}
      {showDetailsModal && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedSurvey.title}</h2>
                <p className="text-emerald-100 text-sm">Survey Details & Configuration</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Status Banner */}
              <div className={`rounded-lg p-3 border-2 ${
                selectedSurvey.status === 'active' ? 'bg-green-50 border-green-200' :
                selectedSurvey.status === 'draft' ? 'bg-yellow-50 border-yellow-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedSurvey.status === 'active' && <CheckCircle className="h-8 w-8 text-green-600" />}
                    {selectedSurvey.status === 'draft' && <Clock className="h-8 w-8 text-yellow-600" />}
                    {selectedSurvey.status === 'closed' && <X className="h-8 w-8 text-gray-600" />}
                    <div>
                      <h3 className={`text-lg font-bold ${
                        selectedSurvey.status === 'active' ? 'text-green-900' :
                        selectedSurvey.status === 'draft' ? 'text-yellow-900' :
                        'text-gray-900'
                      }`}>
                        {selectedSurvey.status === 'active' ? 'Active Survey' :
                         selectedSurvey.status === 'draft' ? 'Draft Survey' :
                         'Closed Survey'}
                      </h3>
                      <p className={`text-sm ${
                        selectedSurvey.status === 'active' ? 'text-green-700' :
                        selectedSurvey.status === 'draft' ? 'text-yellow-700' :
                        'text-gray-700'
                      }`}>
                        {selectedSurvey.status === 'active' ? 'Currently collecting responses' :
                         selectedSurvey.status === 'draft' ? 'Not yet published' :
                         'No longer accepting responses'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedSurvey.type)}`}>
                    {selectedSurvey.type.charAt(0).toUpperCase() + selectedSurvey.type.slice(1)}
                  </span>
                </div>
              </div>

              {/* Survey Info */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Survey Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-blue-700 font-medium">Description</p>
                    <p className="text-sm text-gray-900">{selectedSurvey.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Category</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedSurvey.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Created By</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedSurvey.createdBy}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Survey Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">Start Date</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(selectedSurvey.startDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">End Date</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(selectedSurvey.endDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                    <span className="text-sm text-gray-700 font-medium">Duration</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {Math.ceil((new Date(selectedSurvey.endDate).getTime() - new Date(selectedSurvey.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-5 border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-white bg-opacity-80 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Questions</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedSurvey.questions}</p>
                  </div>
                  <div className="bg-white bg-opacity-80 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Responses</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedSurvey.responses}</p>
                  </div>
                  <div className="bg-white bg-opacity-80 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Response Rate</p>
                    <p className="text-2xl font-bold text-green-600">{selectedSurvey.responseRate}%</p>
                  </div>
                  <div className="bg-white bg-opacity-80 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Avg Time</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedSurvey.averageCompletionTime}</p>
                    <p className="text-xs text-gray-600">minutes</p>
                  </div>
                </div>
              </div>

              {/* Response Progress */}
              {selectedSurvey.responses > 0 && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="font-bold text-green-900 mb-3">Response Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">Completion Rate</span>
                      <span className="font-bold text-green-600">{selectedSurvey.responseRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${selectedSurvey.responseRate}%` }}
                      >
                        <span className="text-xs text-white font-semibold">{selectedSurvey.responseRate}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {selectedSurvey.responses} responses collected
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t">
              <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
              <button
                onClick={() => handleViewAnalytics(selectedSurvey)}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Survey Analytics
                </h2>
                <p className="text-blue-100 text-sm">{selectedSurvey.title}</p>
              </div>
              <button onClick={() => setShowAnalyticsModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-700 font-medium">Total Responses</p>
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{selectedSurvey.responses}</p>
                  <p className="text-xs text-blue-600 mt-1">Collected responses</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-700 font-medium">Response Rate</p>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-900">{selectedSurvey.responseRate}%</p>
                  <p className="text-xs text-green-600 mt-1">Completion rate</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-purple-700 font-medium">Avg Completion Time</p>
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-900">{selectedSurvey.averageCompletionTime}</p>
                  <p className="text-xs text-purple-600 mt-1">minutes</p>
                </div>
              </div>

              {/* Sample Question Analytics */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">Sample Question Breakdown</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Overall Satisfaction</span>
                      <span className="text-sm font-bold text-green-600">4.5 / 5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Service Quality</span>
                      <span className="text-sm font-bold text-blue-600">4.3 / 5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full" style={{ width: '86%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Technician Professionalism</span>
                      <span className="text-sm font-bold text-purple-600">4.7 / 5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Distribution */}
              <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-2">Response Distribution</h4>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-indigo-600">{rating}</p>
                      <p className="text-xs text-gray-600 mb-2">stars</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${[45, 35, 15, 3, 2][5 - rating]}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{[45, 35, 15, 3, 2][5 - rating]}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t">
              <button onClick={() => setShowAnalyticsModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedSurvey)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
