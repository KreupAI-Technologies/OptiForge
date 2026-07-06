'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail, Building2, User, Users, Calendar, TrendingUp, X, Globe, Clock, CheckCircle, MessageSquare, FileText, PhoneCall, Video, Send, Activity, ArrowRight, Circle, ChevronLeft, ChevronRight, Download, RefreshCw, Upload, Filter, Save, Check, UserPlus, MoreVertical, FileSpreadsheet, ArrowUpDown } from 'lucide-react';
import { DataTable, EmptyState, LoadingState, PageToolbar, ConfirmDialog, useToast } from '@/components/ui';
import { LeadService, Lead as LeadFromService, MOCK_LEAD_ACTIVITIES } from '@/services/lead.service';

// Use Lead interface from service - local type alias for component
type Lead = LeadFromService;

// LeadActivity imported from service
const mockActivities = MOCK_LEAD_ACTIVITIES;

interface LeadStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  icon: any;
  color: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: {
    status: string;
    source: string;
    assignedTo: string;
    valueMin: string;
    valueMax: string;
    dateFrom: string;
    dateTo: string;
  };
}


const getLeadStages = (lead: Lead): LeadStage[] => {
  const stages: LeadStage[] = [
    { id: 'new', name: 'New Lead', status: 'completed', date: lead.createdAt, icon: Circle, color: 'blue' },
    { id: 'contacted', name: 'Contacted', status: 'completed', date: '2025-10-02', icon: PhoneCall, color: 'purple' },
    { id: 'qualified', name: 'Qualified', status: 'current', date: '2025-10-08', icon: CheckCircle, color: 'green' },
    { id: 'proposal', name: 'Proposal Sent', status: 'pending', icon: FileText, color: 'yellow' },
    { id: 'negotiation', name: 'Negotiation', status: 'pending', icon: MessageSquare, color: 'orange' },
    { id: 'won', name: 'Won', status: 'pending', icon: TrendingUp, color: 'emerald' }
  ];

  return stages;
};

const activityIcons = {
  call: PhoneCall,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  status_change: Activity,
  task: CheckCircle,
  proposal: FileText,
  video_call: Video
};

const activityColors = {
  call: 'bg-blue-100 text-blue-600 border-blue-200',
  email: 'bg-purple-100 text-purple-600 border-purple-200',
  meeting: 'bg-green-100 text-green-600 border-green-200',
  note: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  status_change: 'bg-orange-100 text-orange-600 border-orange-200',
  task: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  proposal: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  video_call: 'bg-pink-100 text-pink-600 border-pink-200'
};

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-green-100 text-green-700',
  proposal: 'bg-yellow-100 text-yellow-700',
  negotiation: 'bg-orange-100 text-orange-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
};

const LEAD_SOURCES = ['Website', 'Referral', 'Trade Show', 'LinkedIn', 'Cold Call'];
const ASSIGNED_USERS = ['Sarah Johnson', 'Michael Chen', 'David Park'];
const LEAD_STATUSES: Lead['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export default function LeadsPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enhanced Delete State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Bulk Operations State
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [bulkAssignUser, setBulkAssignUser] = useState('');
  const [bulkStatus, setBulkStatus] = useState<Lead['status']>('new');

  // Inline Status Update State
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

  // Advanced Filtering State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [valueMinFilter, setValueMinFilter] = useState<string>('');
  const [valueMaxFilter, setValueMaxFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Import/Export State
  const [showImportDialog, setShowImportDialog] = useState(false);

  const itemsPerPage = 10;

  // Fetch leads data on mount
  useEffect(() => {
    async function fetchLeads() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await LeadService.getAllLeads();
        setLeads(data);
      } catch (err) {
        console.error('Failed to fetch leads:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch leads'));
        // Do not render mock data in the table; show empty state instead
        setLeads([]);
        addToast({
          title: 'Connection Error',
          message: 'Unable to connect to server. No leads to display.',
          variant: 'warning'
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeads();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (selectedLeadIds.size === 1) {
        const selectedId = Array.from(selectedLeadIds)[0];
        const lead = leads.find(l => l.id === selectedId);

        if (!lead) return;

        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            handleDeleteLead(lead);
            break;
          case 'e':
            e.preventDefault();
            router.push(`/crm/leads/edit/${lead.id}`);
            break;
          case 'v':
            e.preventDefault();
            handleViewLead(lead);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedLeadIds, leads, router]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    const matchesAssignedTo = assignedToFilter === 'all' || lead.assignedTo === assignedToFilter;

    const matchesValueRange = (() => {
      const min = valueMinFilter ? parseFloat(valueMinFilter) : 0;
      const max = valueMaxFilter ? parseFloat(valueMaxFilter) : Infinity;
      return lead.value >= min && lead.value <= max;
    })();

    const matchesDateRange = (() => {
      if (!dateFromFilter && !dateToFilter) return true;
      const leadDate = new Date(lead.createdAt);
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : new Date(0);
      const toDate = dateToFilter ? new Date(dateToFilter) : new Date();
      return leadDate >= fromDate && leadDate <= toDate;
    })();

    return matchesSearch && matchesStatus && matchesSource && matchesAssignedTo && matchesValueRange && matchesDateRange;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: leads.length,
    newLeads: leads.filter((l) => l.status === 'new').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    totalValue: leads.reduce((sum, l) => sum + l.value, 0),
  };

  // Enhanced Delete Handler
  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setShowDeleteDialog(true);
  };

  const confirmDeleteLead = () => {
    if (leadToDelete) {
      setLeads(leads.filter((l) => l.id !== leadToDelete.id));
      setShowDeleteDialog(false);
      setLeadToDelete(null);
      addToast({
        title: 'Lead Deleted',
        message: `${leadToDelete.name} has been successfully deleted.`,
        variant: 'success'
      });
    }
  };

  // Bulk Operations Handlers
  const handleSelectLead = (leadId: string) => {
    const newSelection = new Set(selectedLeadIds);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeadIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.size === paginatedLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(paginatedLeads.map(l => l.id)));
    }
  };

  const handleBulkDelete = () => {
    setLeads(leads.filter(l => !selectedLeadIds.has(l.id)));
    setShowBulkDeleteDialog(false);
    addToast({
      title: 'Leads Deleted',
      message: `${selectedLeadIds.size} leads have been successfully deleted.`,
      variant: 'success'
    });
    setSelectedLeadIds(new Set());
  };

  const handleBulkAssign = () => {
    if (!bulkAssignUser) return;

    setLeads(leads.map(lead =>
      selectedLeadIds.has(lead.id)
        ? { ...lead, assignedTo: bulkAssignUser }
        : lead
    ));
    setShowBulkAssignDialog(false);
    addToast({
      title: 'Leads Assigned',
      message: `${selectedLeadIds.size} leads have been assigned to ${bulkAssignUser}.`,
      variant: 'success'
    });
    setSelectedLeadIds(new Set());
    setBulkAssignUser('');
  };

  const handleBulkStatusChange = () => {
    setLeads(leads.map(lead =>
      selectedLeadIds.has(lead.id)
        ? { ...lead, status: bulkStatus }
        : lead
    ));
    setShowBulkStatusDialog(false);
    addToast({
      title: 'Status Updated',
      message: `${selectedLeadIds.size} leads have been updated to ${bulkStatus}.`,
      variant: 'success'
    });
    setSelectedLeadIds(new Set());
  };

  // Inline Status Update
  const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
    setLeads(leads.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
    setStatusDropdownOpen(null);
    addToast({
      title: 'Status Updated',
      message: `Lead status has been updated to ${newStatus}.`,
      variant: 'success'
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Source', 'Value', 'Assigned To', 'Created At'];
    const csvData = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        lead.name,
        lead.company,
        lead.email,
        lead.phone,
        lead.status,
        lead.source,
        lead.value,
        lead.assignedTo,
        lead.createdAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addToast({
      title: 'Export Successful',
      message: `${filteredLeads.length} leads exported to CSV.`,
      variant: 'success'
    });
  };

  // Export to Excel (simplified CSV for now)
  const handleExportExcel = () => {
    handleExportCSV();
  };

  // Save Filter
  const handleSaveFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: {
        status: statusFilter,
        source: sourceFilter,
        assignedTo: assignedToFilter,
        valueMin: valueMinFilter,
        valueMax: valueMaxFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter
      }
    };

    setSavedFilters([...savedFilters, newFilter]);
    setShowSaveFilterDialog(false);
    setFilterName('');
    addToast({
      title: 'Filter Saved',
      message: `Filter "${newFilter.name}" has been saved successfully.`,
      variant: 'success'
    });
  };

  // Load Saved Filter
  const loadSavedFilter = (filter: SavedFilter) => {
    setStatusFilter(filter.filters.status);
    setSourceFilter(filter.filters.source);
    setAssignedToFilter(filter.filters.assignedTo);
    setValueMinFilter(filter.filters.valueMin);
    setValueMaxFilter(filter.filters.valueMax);
    setDateFromFilter(filter.filters.dateFrom);
    setDateToFilter(filter.filters.dateTo);
    addToast({
      title: 'Filter Loaded',
      message: `Filter "${filter.name}" has been applied.`,
      variant: 'info'
    });
  };

  // Clear Filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSourceFilter('all');
    setAssignedToFilter('all');
    setValueMinFilter('');
    setValueMaxFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  // Quick Actions
  const handleQuickCall = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    addToast({
      title: 'Initiating Call',
      message: `Calling ${lead.name} at ${lead.phone}`,
      variant: 'info'
    });
  };

  const handleQuickEmail = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:${lead.email}`;
  };

  const handleQuickConvert = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    addToast({
      title: 'Convert Lead',
      message: `Converting ${lead.name} to opportunity...`,
      variant: 'info'
    });
  };

  const handleViewLead = (lead: Lead) => {
    router.push(`/crm/leads/view/${lead.id}`);
  };

  // Get impact analysis for delete
  const getDeleteImpactAnalysis = (lead: Lead) => {
    const activities = mockActivities.filter(a => a.leadId === lead.id).length;
    return [
      { label: 'Activities', count: activities },
      { label: 'Opportunities', count: 1 },
      { label: 'Documents', count: 3 }
    ];
  };

  // Refetch function for refresh button
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await LeadService.getAllLeads();
      setLeads(data);
      addToast({
        title: 'Refreshed',
        message: 'Lead data has been refreshed.',
        variant: 'success'
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh leads'));
      addToast({
        title: 'Refresh Failed',
        message: 'Unable to refresh data. Please try again.',
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading skeleton on initial load
  if (isLoading && leads.length === 0) {
    return (
      <div className="w-full h-full px-3 py-2">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Page Header with Toolbar */}
      <PageToolbar

        subtitle={`${stats.total} leads · ${stats.newLeads} new · ${stats.qualified} qualified`}
        breadcrumbs={[
          { label: 'CRM', href: '/crm' },
          { label: 'Leads' }
        ]}
        actions={[
          {
            label: 'Import',
            icon: Upload,
            variant: 'secondary',
            onClick: () => setShowImportDialog(true)
          },
          {
            label: 'Export',
            icon: Download,
            variant: 'secondary',
            onClick: handleExportCSV
          },
          {
            label: 'Refresh',
            icon: RefreshCw,
            variant: 'secondary',
            onClick: handleRefresh
          },
          {
            label: 'Add New Lead',
            icon: Plus,
            variant: 'primary',
            href: '/crm/leads/add'
          }
        ]}
        tabs={[
          { id: 'all', label: 'All Leads', count: stats.total },
          { id: 'new', label: 'New', count: stats.newLeads },
          { id: 'qualified', label: 'Qualified', count: stats.qualified }
        ]}
        activeTab={statusFilter}
        onTabChange={(tabId) => setStatusFilter(tabId === 'all' ? 'all' : tabId)}
      />

      {/* Stats Grid (moved below toolbar) */}
      <div className="mb-3 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Leads</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">New Leads</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.newLeads}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Qualified</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.qualified}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Total Value</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">${(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeadIds.size > 0 && (
        <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBulkAssignDialog(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <UserPlus className="h-4 w-4" />
                <span>Assign</span>
              </button>
              <button
                onClick={() => setShowBulkStatusDialog(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Change Status</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowBulkDeleteDialog(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedLeadIds(new Set())}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <X className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-3">
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              showAdvancedFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Advanced Filters</span>
          </button>
          {(sourceFilter !== 'all' || assignedToFilter !== 'all' || valueMinFilter || valueMaxFilter || dateFromFilter || dateToFilter) && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="h-5 w-5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sources</option>
                  {LEAD_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  value={assignedToFilter}
                  onChange={(e) => setAssignedToFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  {ASSIGNED_USERS.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  {LEAD_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Value ($)</label>
                <input
                  type="number"
                  value={valueMinFilter}
                  onChange={(e) => setValueMinFilter(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Value ($)</label>
                <input
                  type="number"
                  value={valueMaxFilter}
                  onChange={(e) => setValueMaxFilter(e.target.value)}
                  placeholder="999999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSaveFilterDialog(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Filter</span>
                </button>

                {savedFilters.length > 0 && (
                  <select
                    onChange={(e) => {
                      const filter = savedFilters.find(f => f.id === e.target.value);
                      if (filter) loadSavedFilter(filter);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Load Saved Filter...</option>
                    {savedFilters.map(filter => (
                      <option key={filter.id} value={filter.id}>{filter.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <span className="text-sm text-gray-600">
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState message="Loading leads..." />
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery || statusFilter !== 'all' ? "No leads found" : "No leads yet"}
          description={
            searchQuery || statusFilter !== 'all'
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Get started by adding your first lead to the system."
          }
          action={{
            label: "Add New Lead",
            onClick: () => router.push('/crm/leads/add'),
            icon: Plus
          }}
          secondaryAction={
            searchQuery || statusFilter !== 'all'
              ? {
                  label: "Clear Filters",
                  onClick: () => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.size === paginatedLeads.length && paginatedLeads.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quick Actions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className={`hover:bg-gray-50 transition-colors ${selectedLeadIds.has(lead.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.has(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.source}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {lead.company}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.email}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusDropdownOpen(statusDropdownOpen === lead.id ? null : lead.id);
                        }}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[lead.status]} hover:opacity-80 transition-opacity cursor-pointer`}
                      >
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </button>

                      {statusDropdownOpen === lead.id && (
                        <div className="absolute z-10 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200">
                          {LEAD_STATUSES.map(status => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(lead.id, status);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                                lead.status === status ? 'bg-gray-50 font-semibold' : ''
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">${lead.value.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleQuickCall(lead, e)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Call"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleQuickEmail(lead, e)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleQuickConvert(lead, e)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Convert to Opportunity"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewLead(lead);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"

                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/crm/leads/edit/${lead.id}`);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"

                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLead(lead);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"

                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredLeads.length)}</span> of{' '}
                    <span className="font-medium">{filteredLeads.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setLeadToDelete(null);
        }}
        onConfirm={confirmDeleteLead}
        title="Delete Lead"
        message={`Are you sure you want to delete ${leadToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete Lead"
        variant="danger"
        impactAnalysis={leadToDelete ? getDeleteImpactAnalysis(leadToDelete) : undefined}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Leads"
        message={`Are you sure you want to delete ${selectedLeadIds.size} lead${selectedLeadIds.size > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
      />

      {/* Bulk Assign Dialog */}
      {showBulkAssignDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Leads</h3>
            <p className="text-sm text-gray-600 mb-2">
              Assign {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? 's' : ''} to:
            </p>
            <select
              value={bulkAssignUser}
              onChange={(e) => setBulkAssignUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="">Select User...</option>
              {ASSIGNED_USERS.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowBulkAssignDialog(false);
                  setBulkAssignUser('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={!bulkAssignUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Change Dialog */}
      {showBulkStatusDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Status</h3>
            <p className="text-sm text-gray-600 mb-2">
              Change status for {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? 's' : ''} to:
            </p>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as Lead['status'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              {LEAD_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBulkStatusDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStatusChange}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveFilterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Filter</h3>
            <p className="text-sm text-gray-600 mb-2">
              Give your filter a name to save it for future use.
            </p>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Filter name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowSaveFilterDialog(false);
                  setFilterName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Import Leads</h3>
              <button
                onClick={() => setShowImportDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your CSV or Excel file here, or click to browse
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Choose File
              </button>
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-medium mb-2">Import Requirements:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>- File must be in CSV or Excel format</li>
                <li>- Required columns: Name, Company, Email, Phone</li>
                <li>- Optional columns: Status, Source, Value, Assigned To</li>
                <li>- Maximum 1000 leads per import</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {selectedLeadIds.size === 1 && (
        <div className="fixed bottom-4 left-4 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">Keyboard Shortcuts:</p>
          <p>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">D</kbd> to Delete</p>
          <p>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">E</kbd> to Edit</p>
          <p>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">V</kbd> to View</p>
        </div>
      )}

      {/* Lead Detail Modal - Enhanced View */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h2>
                  <p className="text-sm text-gray-600">{selectedLead.company}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Status and Value Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-medium text-green-600 uppercase mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusColors[selectedLead.status]}`}>
                    {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs font-medium text-blue-600 uppercase mb-1">Deal Value</p>
                  <p className="text-2xl font-bold text-blue-900">${selectedLead.value.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs font-medium text-purple-600 uppercase mb-1">Source</p>
                  <p className="text-lg font-semibold text-purple-900">{selectedLead.source}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                  <p className="text-xs font-medium text-orange-600 uppercase mb-1">Assigned To</p>
                  <p className="text-lg font-semibold text-orange-900">{selectedLead.assignedTo}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Full Name</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedLead.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Job Title</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Company Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Company Name</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedLead.company}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Website</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Industry</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Company Size</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-blue-600" />
                  Contact Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                        <a href={`mailto:${selectedLead.email}`} className="text-sm text-blue-600 hover:underline break-all">{selectedLead.email}</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                        <a href={`tel:${selectedLead.phone}`} className="text-sm text-blue-600 hover:underline">{selectedLead.phone}</a>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Mobile</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Fax</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Street Address</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">City</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">State/Province</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Postal Code</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Country</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Lead Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Lead Status</p>
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusColors[selectedLead.status]}`}>
                        {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Lead Rating</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Lead Source</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedLead.source}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Sub-Source</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Referred By</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Campaign</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opportunity Information */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Opportunity Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Estimated Value</p>
                      <p className="text-lg font-bold text-blue-900">${selectedLead.value.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Expected Close Date</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Win Probability</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Product Interest</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  Social Media
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">LinkedIn</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Twitter</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Facebook</p>
                      <p className="text-sm text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Progress Tracker */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Lead Progress
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3">
                  {/* Progress Stages */}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      {getLeadStages(selectedLead).map((stage, index) => {
                        const StageIcon = stage.icon;
                        const isLast = index === getLeadStages(selectedLead).length - 1;

                        return (
                          <div key={stage.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center relative z-10">
                              {/* Stage Icon */}
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all ${
                                stage.status === 'completed'
                                  ? 'bg-green-500 border-green-600'
                                  : stage.status === 'current'
                                  ? 'bg-blue-500 border-blue-600 ring-4 ring-blue-200'
                                  : 'bg-gray-200 border-gray-300'
                              }`}>
                                <StageIcon className={`h-6 w-6 ${
                                  stage.status === 'completed' || stage.status === 'current'
                                    ? 'text-white'
                                    : 'text-gray-400'
                                }`} />
                              </div>

                              {/* Stage Name */}
                              <div className="mt-2 text-center">
                                <p className={`text-xs font-semibold ${
                                  stage.status === 'current' ? 'text-blue-900' : 'text-gray-700'
                                }`}>
                                  {stage.name}
                                </p>
                                {stage.date && (
                                  <p className="text-xs text-gray-500 mt-0.5">{stage.date}</p>
                                )}
                              </div>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                              <div className={`flex-1 h-1 mx-2 rounded ${
                                stage.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Activity Timeline
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  {/* Add Activity Actions */}
                  <div className="mb-2 flex flex-wrap gap-2">
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium">
                      <PhoneCall className="h-4 w-4" />
                      <span>Log Call</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      <span>Send Email</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      <span>Schedule Meeting</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      <span>Add Note</span>
                    </button>
                  </div>

                  {/* Activities List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {mockActivities
                      .filter(activity => activity.leadId === selectedLead.id)
                      .map((activity, index) => {
                        const ActivityIcon = activityIcons[activity.type];
                        const isLast = index === mockActivities.filter(a => a.leadId === selectedLead.id).length - 1;

                        return (
                          <div key={activity.id} className="relative">
                            {/* Timeline connector */}
                            {!isLast && (
                              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                            )}

                            <div className="flex items-start space-x-3">
                              {/* Activity Icon */}
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${activityColors[activity.type]}`}>
                                <ActivityIcon className="h-5 w-5" />
                              </div>

                              {/* Activity Content */}
                              <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-1">
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-900">{activity.title}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      by {activity.performedBy} • {activity.timestamp}
                                    </p>
                                  </div>
                                  {activity.metadata?.outcome && (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                      activity.metadata.outcome === 'Positive'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {activity.metadata.outcome}
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-gray-700 mb-2">{activity.description}</p>

                                {/* Activity Metadata */}
                                {activity.metadata && (
                                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                    {activity.metadata.duration && (
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{activity.metadata.duration}</span>
                                      </div>
                                    )}
                                    {activity.metadata.attachments && (
                                      <div className="flex items-center space-x-1">
                                        <FileText className="h-3 w-3" />
                                        <span>{activity.metadata.attachments} attachments</span>
                                      </div>
                                    )}
                                    {activity.metadata.previousStatus && activity.metadata.newStatus && (
                                      <div className="flex items-center space-x-1">
                                        <ArrowRight className="h-3 w-3" />
                                        <span className="capitalize">{activity.metadata.previousStatus}</span>
                                        <ArrowRight className="h-3 w-3" />
                                        <span className="capitalize font-semibold">{activity.metadata.newStatus}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Key Dates
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Created</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedLead.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <PhoneCall className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Last Contact</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedLead.lastContact}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Activities</p>
                        <p className="text-sm font-semibold text-gray-900">{mockActivities.filter(a => a.leadId === selectedLead.id).length} Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
              >
                Close
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push(`/crm/leads/edit/${selectedLead.id}`)}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Lead</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
