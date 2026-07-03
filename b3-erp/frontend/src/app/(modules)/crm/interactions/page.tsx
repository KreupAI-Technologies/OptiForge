'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail, MessageSquare, MapPin, Headphones, AlertCircle, ThumbsUp, Calendar, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePageVisitLogger } from '@/hooks/usePageVisitLogger';
import { useToast, ConfirmDialog } from '@/components/ui';
import { interactionsService } from '@/services/interactions.service';

interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'site_visit' | 'support' | 'complaint' | 'feedback';
  customer: string;
  contactPerson: string;
  subject: string;
  performedBy: string;
  dateTime: string;
  duration: string;
  outcome: 'positive' | 'neutral' | 'negative' | 'follow_up_required';
}

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: MessageSquare,
  site_visit: MapPin,
  support: Headphones,
  complaint: AlertCircle,
  feedback: ThumbsUp,
};

const typeColors = {
  call: 'bg-blue-100 text-blue-700 border-blue-200',
  email: 'bg-purple-100 text-purple-700 border-purple-200',
  meeting: 'bg-green-100 text-green-700 border-green-200',
  site_visit: 'bg-orange-100 text-orange-700 border-orange-200',
  support: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  complaint: 'bg-red-100 text-red-700 border-red-200',
  feedback: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const outcomeColors = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-700',
  follow_up_required: 'bg-yellow-100 text-yellow-700',
};

export default function InteractionsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [interactionToDelete, setInteractionToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Automatically log page visits
  usePageVisitLogger('/crm/interactions', true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Service returns the raw interaction shape; map defensively to the
        // page's Interaction model.
        const raw = (await interactionsService.getAllInteractions()) as any[];
        const mapped: Interaction[] = (raw || []).map((i) => ({
          id: String(i.id),
          type: (i.type ?? 'call') as Interaction['type'],
          customer: i.customer ?? '',
          contactPerson: i.contactPerson ?? '',
          subject: i.subject ?? '',
          performedBy: i.performedBy ?? '',
          dateTime: i.dateTime ?? i.createdAt ?? '',
          duration: i.duration ?? '',
          outcome: (i.outcome ?? 'neutral') as Interaction['outcome'],
        }));
        if (!cancelled) setInteractions(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load interactions');
          setInteractions([]);
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

  const filteredInteractions = interactions.filter((interaction) => {
    const matchesSearch =
      interaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || interaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInteractions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInteractions = filteredInteractions.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    total: interactions.length,
    thisWeek: interactions.filter((i) => new Date(i.dateTime) >= oneWeekAgo).length,
    calls: interactions.filter((i) => i.type === 'call').length,
    meetings: interactions.filter((i) => i.type === 'meeting').length,
  };

  const handleDeleteInteraction = (id: string) => {
    setInteractionToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (interactionToDelete) {
      setInteractions(interactions.filter((i) => i.id !== interactionToDelete));
      addToast({
        title: 'Interaction Deleted',
        message: 'The interaction has been deleted successfully',
        variant: 'success'
      });
      setShowDeleteDialog(false);
      setInteractionToDelete(null);
    }
  };

  const handleViewInteraction = (interaction: Interaction) => {
    router.push(`/crm/interactions/view/${interaction.id}`);
  };

  const formatTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatOutcomeLabel = (outcome: string) => {
    return outcome.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="w-full min-h-screen px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading interactions…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && interactions.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No interactions found.
        </div>
      )}
      {/* Stats with Add Button */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Interactions</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">This Week</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.thisWeek}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Calls</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.calls}</p>
              </div>
              <Phone className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Meetings</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.meetings}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/crm/interactions/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Log Interaction</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search interactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="site_visit">Site Visit</option>
          <option value="support">Support</option>
          <option value="complaint">Complaint</option>
          <option value="feedback">Feedback</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact Person</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedInteractions.map((interaction) => {
              const TypeIcon = typeIcons[interaction.type];
              return (
                <tr key={interaction.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{interaction.dateTime}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border ${typeColors[interaction.type]}`}>
                      <TypeIcon className="h-4 w-4" />
                      <span className="text-xs font-semibold">{formatTypeLabel(interaction.type)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{interaction.customer}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{interaction.contactPerson}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{interaction.subject}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{interaction.performedBy}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-600">{interaction.duration}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${outcomeColors[interaction.outcome]}`}>
                      {formatOutcomeLabel(interaction.outcome)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleViewInteraction(interaction)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                       
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => router.push(`/crm/interactions/edit/${interaction.id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                       
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteInteraction(interaction.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                       
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInteractions.length)} of {filteredInteractions.length} items
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setInteractionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Interaction"
        message="Are you sure you want to delete this interaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
