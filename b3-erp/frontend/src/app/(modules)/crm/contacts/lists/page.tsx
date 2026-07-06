'use client';

import { useState, useEffect } from 'react';
import { List, Users, Mail, Phone, Filter as FilterIcon, TrendingUp, Target, Calendar, Search, Plus, Edit, Trash2, Eye, Download, Upload, CheckCircle, XCircle, Clock, BarChart3, Send, UserPlus, Copy, Archive } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  type: 'static' | 'dynamic' | 'smart';
  category: string;
  filters: string[];
  emailsSent: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  lastUpdated: string;
  createdDate: string;
  owner: string;
  status: 'active' | 'archived' | 'draft';
  color: string;
  tags: string[];
}

interface ListContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  addedDate: string;
  lastEngagement: string;
  engagementScore: number;
  status: 'subscribed' | 'unsubscribed' | 'bounced';
}

const mockContacts: ListContact[] = [
  {
    id: '1',
    name: 'John Anderson',
    email: 'john.anderson@enterprise.com',
    phone: '+1 (555) 123-4567',
    company: 'Enterprise Corp',
    title: 'CTO',
    addedDate: '2024-08-15',
    lastEngagement: '2024-10-18',
    engagementScore: 85,
    status: 'subscribed',
  },
  {
    id: '2',
    name: 'Lisa Thompson',
    email: 'lisa.t@techventures.com',
    phone: '+1 (555) 234-5678',
    company: 'TechVentures',
    title: 'VP Engineering',
    addedDate: '2024-07-20',
    lastEngagement: '2024-10-15',
    engagementScore: 72,
    status: 'subscribed',
  },
  {
    id: '3',
    name: 'Robert Chang',
    email: 'robert.chang@innovate.io',
    phone: '+1 (555) 345-6789',
    company: 'Innovate Systems',
    title: 'Director of IT',
    addedDate: '2024-09-05',
    lastEngagement: '2024-10-10',
    engagementScore: 58,
    status: 'subscribed',
  },
];

export default function ContactListsPage() {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacts] = useState<ListContact[]>(mockContacts);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const data = await crmService.contactLists.getAll();
        const rows = Array.isArray(data) ? data : [];
        if (!mounted) return;
        setLists(rows.map((r: any): ContactList => ({
          id: String(r.id ?? ''),
          name: r.name ?? '',
          description: r.description ?? '',
          contactCount: r.contactCount ?? 0,
          type: (r.type ?? 'static') as ContactList['type'],
          category: r.category ?? '',
          filters: Array.isArray(r.filters)
            ? r.filters
            : Array.isArray(r.criteria)
              ? r.criteria
              : r.criteria
                ? Object.entries(r.criteria).map(([k, v]) => `${k}: ${v}`)
                : [],
          emailsSent: r.emailsSent ?? 0,
          openRate: r.openRate ?? 0,
          clickRate: r.clickRate ?? 0,
          unsubscribeRate: r.unsubscribeRate ?? 0,
          lastUpdated: r.lastUpdated ?? r.lastUsed ?? r.updatedAt ?? '',
          createdDate: r.createdDate ?? r.createdAt ?? '',
          owner: r.owner ?? '',
          status: (r.status ?? 'active') as ContactList['status'],
          color: r.color ?? '',
          tags: Array.isArray(r.tags) ? r.tags : [],
        })));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load'); setLists([]);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);
  const handleDeleteList = async (id: string) => {
    if (!id) return;
    if (typeof window !== 'undefined' && !window.confirm('Delete this contact list?')) return;
    try {
      await crmService.contactLists.delete(id);
      setLists(prev => prev.filter(l => l.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Failed to delete list');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'static' | 'dynamic' | 'smart'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'contacts' | 'openRate' | 'updated'>('updated');
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);

  const categories = ['all', ...Array.from(new Set(lists.map(l => l.category)))];

  const filteredLists = lists
    .filter(list => {
      const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          list.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          list.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || list.type === filterType;
      const matchesCategory = filterCategory === 'all' || list.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || list.status === filterStatus;
      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'contacts':
          return b.contactCount - a.contactCount;
        case 'openRate':
          return b.openRate - a.openRate;
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

  const sentLists = lists.filter(l => l.emailsSent > 0);
  const stats = {
    totalLists: lists.filter(l => l.status === 'active').length,
    totalContacts: lists.reduce((sum, l) => sum + l.contactCount, 0),
    avgOpenRate: sentLists.length ? sentLists.reduce((sum, l) => sum + l.openRate, 0) / sentLists.length : 0,
    avgClickRate: sentLists.length ? sentLists.reduce((sum, l) => sum + l.clickRate, 0) / sentLists.length : 0,
    totalEmailsSent: lists.reduce((sum, l) => sum + l.emailsSent, 0),
    avgUnsubscribeRate: sentLists.length ? sentLists.reduce((sum, l) => sum + l.unsubscribeRate, 0) / sentLists.length : 0,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'static':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dynamic':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'smart':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (rate: number, type: 'open' | 'click' | 'unsub') => {
    if (type === 'unsub') {
      if (rate < 1) return 'text-green-600';
      if (rate < 2) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (rate >= 40) return 'text-green-600';
    if (rate >= 25) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {error && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>)}
      <div className="mb-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <List className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalLists}</div>
            <div className="text-purple-100">Active Lists</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{(stats.totalContacts / 1000).toFixed(1)}K</div>
            <div className="text-blue-100">Total Contacts</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{(stats.totalEmailsSent / 1000).toFixed(0)}K</div>
            <div className="text-green-100">Emails Sent</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgOpenRate.toFixed(1)}%</div>
            <div className="text-orange-100">Avg Open Rate</div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgClickRate.toFixed(1)}%</div>
            <div className="text-teal-100">Avg Click Rate</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgUnsubscribeRate.toFixed(1)}%</div>
            <div className="text-red-100">Avg Unsub Rate</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search lists, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="static">Static</option>
                <option value="dynamic">Dynamic</option>
                <option value="smart">Smart</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="updated">Sort by Updated</option>
                <option value="name">Sort by Name</option>
                <option value="contacts">Sort by Contacts</option>
                <option value="openRate">Sort by Open Rate</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredLists.map((list) => (
          <div key={list.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{list.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(list.type)}`}>
                      {list.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(list.status)}`}>
                      {list.status}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {list.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{list.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {list.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Filters */}
                  <div className="mb-2">
                    <div className="text-xs text-gray-600 mb-2">Applied Filters:</div>
                    <div className="flex flex-wrap gap-2">
                      {list.filters.map((filter, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Copy className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Copy</span>
                  </button>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Delete</span>
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-6 gap-2 mb-2 pt-4 border-t border-gray-100">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    Contacts
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {list.contactCount.toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                    <Mail className="w-4 h-4" />
                    Emails Sent
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {list.emailsSent.toLocaleString()}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
                    <Target className="w-4 h-4" />
                    Open Rate
                  </div>
                  <div className={`text-2xl font-bold ${getPerformanceColor(list.openRate, 'open')}`}>
                    {list.openRate.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-teal-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-teal-600 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Click Rate
                  </div>
                  <div className={`text-2xl font-bold ${getPerformanceColor(list.clickRate, 'click')}`}>
                    {list.clickRate.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                    <XCircle className="w-4 h-4" />
                    Unsub Rate
                  </div>
                  <div className={`text-2xl font-bold ${getPerformanceColor(list.unsubscribeRate, 'unsub')}`}>
                    {list.unsubscribeRate.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-600 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    Updated
                  </div>
                  <div className="text-sm font-bold text-purple-900">
                    {new Date(list.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedList(list)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  View Contacts
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Send className="w-4 h-4" />
                  Send Campaign
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <UserPlus className="w-4 h-4" />
                  Add Contacts
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Owner: {list.owner}</span>
                <span>Created: {new Date(list.createdDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* List Contacts Modal */}
      {selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg  w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedList.name}</h2>
                  <p className="text-gray-600">{selectedList.contactCount.toLocaleString()} contacts in this list</p>
                </div>
                <button
                  onClick={() => setSelectedList(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            contact.status === 'subscribed' ? 'bg-green-100 text-green-700' :
                            contact.status === 'unsubscribed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {contact.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </div>
                          <div>
                            <span className="font-medium">{contact.company}</span> • {contact.title}
                          </div>
                          <div>
                            Last engagement: {new Date(contact.lastEngagement).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Engagement Score</div>
                        <div className={`text-2xl font-bold ${getEngagementColor(contact.engagementScore)}`}>
                          {contact.engagementScore}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No contacts to display
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
