'use client';

import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, Search, Plus, Filter, Calendar, User, MessageSquare, CheckCircle, Clock, TrendingDown, Zap, Inbox } from 'lucide-react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';

interface Complaint {
  id: string;
  title: string;
  description: string;
  complainantName: string;
  email: string;
  phone: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  date: string;
  resolvedDate?: string;
  responseTime?: number; // in hours
  resolutionTime?: number; // in hours
  assignedTo?: string;
  attachments: number;
}

// Defensive mapper: backend feedback row -> page Complaint model.
function mapComplaint(r: any): Complaint {
  return {
    id: String(r?.id ?? r?.reference ?? ''),
    title: r?.title ?? r?.subject ?? '',
    description: r?.description ?? '',
    complainantName: r?.complainantName ?? r?.customerName ?? '',
    email: r?.email ?? '',
    phone: r?.phone ?? '',
    status: (r?.status ?? 'open') as Complaint['status'],
    priority: (r?.priority ?? 'medium') as Complaint['priority'],
    category: r?.category ?? 'General',
    date: r?.date ?? r?.createdAt ?? '',
    resolvedDate: r?.resolvedDate,
    responseTime: r?.responseTime,
    resolutionTime: r?.resolutionTime,
    assignedTo: r?.assignedTo,
    attachments: Number(r?.attachments ?? 0),
  };
}

export default function ComplaintsPage() {
  const [mockComplaints, setMockComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.complaints()) as any[];
        if (!cancelled) setMockComplaints(Array.isArray(raw) ? raw.map(mapComplaint) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load complaints');
          setMockComplaints([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('open');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'priority' | 'responseTime'>('recent');

  const categories = ['Technician Behavior', 'Product Quality', 'Installation Quality', 'Billing Issue', 'Delivery', 'Warranty', 'Customer Support', 'Service Scheduling'];
  const priorities = ['critical', 'high', 'medium', 'low'];

  const filteredComplaints = useMemo(() => {
    let filtered = mockComplaints.filter(complaint => {
      const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complainantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = complaint.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || complaint.priority === selectedPriority;
      const matchesCategory = selectedCategory === 'all' || complaint.category === selectedCategory;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    // Sort
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      filtered.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);
    } else if (sortBy === 'responseTime') {
      filtered.sort((a, b) => (a.responseTime || 999) - (b.responseTime || 999));
    } else {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return filtered;
  }, [searchTerm, selectedStatus, selectedPriority, selectedCategory, sortBy]);

  const stats = {
    total: mockComplaints.length,
    open: mockComplaints.filter(c => c.status === 'open').length,
    inProgress: mockComplaints.filter(c => c.status === 'in-progress').length,
    resolved: mockComplaints.filter(c => c.status === 'resolved').length,
    critical: mockComplaints.filter(c => c.priority === 'critical').length,
    avgResponseTime: (mockComplaints.filter(c => c.responseTime).reduce((sum, c) => sum + (c.responseTime || 0), 0) / mockComplaints.filter(c => c.responseTime).length).toFixed(1)
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-emerald-600" />
            Customer Complaints
          </h1>
          <p className="text-gray-600 mt-1">Track and manage customer complaints and issues</p>
        </div>
        <button className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md">
          <Plus className="h-5 w-5" />
          New Complaint
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Inbox className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.open}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.critical}</p>
              <p className="text-xs text-gray-500 mt-1">Avg Response: {stats.avgResponseTime}h</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-orange-600" />
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
              placeholder="Search by title, customer, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="recent">Recently Reported</option>
                <option value="priority">By Priority</option>
                <option value="responseTime">Fastest Response</option>
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

      {/* Complaints List */}
      <div className="space-y-2">
        {filteredComplaints.map((complaint) => (
          <div key={complaint.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{complaint.title}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority.toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {getStatusIcon(complaint.status)}
                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('-', ' ')}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{complaint.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Reported By</p>
                    <p className="text-sm font-semibold text-gray-900">{complaint.complainantName}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Category</p>
                    <p className="text-sm font-semibold text-gray-900">{complaint.category}</p>
                  </div>
                  {complaint.responseTime && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Response Time</p>
                      <p className="text-sm font-semibold text-gray-900">{complaint.responseTime}h</p>
                    </div>
                  )}
                  {complaint.resolutionTime && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Resolution Time</p>
                      <p className="text-sm font-semibold text-gray-900">{complaint.resolutionTime}h</p>
                    </div>
                  )}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Attachments</p>
                    <p className="text-sm font-semibold text-gray-900">{complaint.attachments}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {complaint.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(complaint.date).toLocaleDateString('en-IN')}
                  </div>
                  {complaint.assignedTo && (
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      Assigned to: {complaint.assignedTo}
                    </div>
                  )}
                </div>
              </div>

              <button className="ml-6 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-emerald-600 hover:text-emerald-700 font-medium text-sm flex-shrink-0">
                View Details
              </button>
            </div>
          </div>
        ))}

        {filteredComplaints.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <CheckCircle className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-600 font-medium">No complaints found</p>
            <p className="text-gray-500 text-sm">Great job! No complaints match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
