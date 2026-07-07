'use client'
import { useState, useEffect, useCallback } from 'react'
import { Clock, AlertTriangle, CheckCircle, TrendingUp, Target, X, Eye, RefreshCw, Filter, User, Package, Calendar, Loader2 } from 'lucide-react'
import { AfterSalesPagesService } from '@/services/after-sales-pages.service'

interface SLATicket {
  id: string;
  ticketNumber: string;
  customer: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'on_track' | 'at_risk' | 'breached' | 'met';
  responseDeadline: string;
  resolutionDeadline: string;
  timeRemaining: number; // minutes
  assignedTo: string;
  issueType: string;
}

const DEFAULT_STATS = {
  compliance: 0,
  metSLA: 0,
  atRisk: 0,
  breached: 0,
  avgResponse: 0
};

export default function LiveSLATracking() {
  const [realTime, setRealTime] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SLATicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tickets, setTickets] = useState<SLATicket[]>([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    AfterSalesPagesService.slaLive()
      .then((data) => {
        if (cancelled) return;
        setTickets(
          Array.isArray(data?.tickets)
            ? (data.tickets as unknown as SLATicket[])
            : []
        );
        setStats({ ...DEFAULT_STATS, ...(data?.stats ?? {}) });
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load SLA data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => setRealTime(prev => prev + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = statusFilter === 'all'
    ? tickets
    : tickets.filter(t => t.status === statusFilter);

  const handleViewDetails = (ticket: SLATicket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-700 border-green-200';
      case 'at_risk': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'breached': return 'bg-red-100 text-red-700 border-red-200';
      case 'met': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-700 border-red-200';
      case 'P2': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'P3': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'P4': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 0) {
      const absMinutes = Math.abs(minutes);
      const hours = Math.floor(absMinutes / 60);
      const mins = absMinutes % 60;
      return (
        <span className="text-red-600 font-semibold">
          Overdue by {hours}h {mins}m
        </span>
      );
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 1) {
      return <span className="text-red-600 font-semibold">{mins}m left</span>;
    }
    if (hours < 2) {
      return <span className="text-orange-600 font-semibold">{hours}h {mins}m left</span>;
    }
    return <span className="text-gray-600">{hours}h {mins}m left</span>;
  };

  return (
    <div className="space-y-3">
      <div className="bg-white shadow-lg p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              Live SLA Tracking
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 animate-pulse">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Live
              </span>
            </h2>
            <p className="text-gray-600 mt-1">Real-time SLA monitoring with automated alerts</p>
          </div>
          <button
            onClick={() => { setRealTime(0); loadData(); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className="bg-white shadow-lg border-2 border-gray-200 rounded-lg p-3 hover:border-blue-500 transition-all text-left"
        >
          <Target className="h-8 w-8 text-blue-600 mb-3" />
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.compliance}%</div>
          <div className="text-sm text-gray-600">SLA Compliance</div>
          <div className="text-xs text-blue-600 mt-2">Click to view all</div>
        </button>

        <button
          onClick={() => setStatusFilter('met')}
          className="bg-white shadow-lg border-2 border-gray-200 rounded-lg p-3 hover:border-green-500 transition-all text-left"
        >
          <CheckCircle className="h-8 w-8 text-green-600 mb-3" />
          <div className="text-3xl font-bold text-green-600 mb-1">{stats.metSLA}</div>
          <div className="text-sm text-gray-600">Met SLA</div>
          <div className="text-xs text-green-600 mt-2">Click to view details</div>
        </button>

        <button
          onClick={() => setStatusFilter('at_risk')}
          className="bg-white shadow-lg border-2 border-gray-200 rounded-lg p-3 hover:border-yellow-500 transition-all text-left"
        >
          <AlertTriangle className="h-8 w-8 text-yellow-600 mb-3" />
          <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.atRisk}</div>
          <div className="text-sm text-gray-600">At Risk</div>
          <div className="text-xs text-yellow-600 mt-2">Click to view details</div>
        </button>

        <button
          onClick={() => setStatusFilter('breached')}
          className="bg-white shadow-lg border-2 border-gray-200 rounded-lg p-3 hover:border-red-500 transition-all text-left"
        >
          <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
          <div className="text-3xl font-bold text-purple-600 mb-1">{stats.avgResponse}h</div>
          <div className="text-sm text-gray-600">Avg Response</div>
          <div className="text-xs text-purple-600 mt-2">Breached: {stats.breached}</div>
        </button>
      </div>

      {/* Filter Indicator */}
      {statusFilter !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Filtered by: <span className="font-bold">{statusFilter.replace('_', ' ').toUpperCase()}</span>
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('all')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Live Tickets Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Live Ticket Monitoring</h3>
          <p className="text-sm text-gray-600">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time Remaining</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> Loading SLA tickets...
                    </span>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-gray-500">
                    No SLA tickets to display.
                  </td>
                </tr>
              )}
              {!loading && !error && filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</div>
                    <div className="text-xs text-gray-500">{ticket.issueType}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{ticket.customer}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">{formatTimeRemaining(ticket.timeRemaining)}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{ticket.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleViewDetails(ticket)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg z-10">
              <div>
                <h2 className="text-xl font-bold">{selectedTicket.ticketNumber}</h2>
                <p className="text-sm text-blue-100 mt-1">SLA Performance Details</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Status Overview */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Current Status</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority} - Critical
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SLA Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time Remaining</p>
                    <div className="text-sm font-semibold mt-1">
                      {formatTimeRemaining(selectedTicket.timeRemaining)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Assignment */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-blue-600">Customer Name</p>
                      <p className="font-semibold text-blue-900">{selectedTicket.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Issue Type</p>
                      <p className="font-semibold text-blue-900">{selectedTicket.issueType}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Assignment
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-green-600">Assigned To</p>
                      <p className="font-semibold text-green-900">{selectedTicket.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Ticket Number</p>
                      <p className="font-semibold text-green-900">{selectedTicket.ticketNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLA Timeline */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  SLA Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600">Response Deadline</span>
                    <span className="font-semibold text-purple-900">
                      {new Date(selectedTicket.responseDeadline).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600">Resolution Deadline</span>
                    <span className="font-semibold text-purple-900">
                      {new Date(selectedTicket.resolutionDeadline).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-purple-300">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          selectedTicket.timeRemaining < 0 ? 'bg-red-500' :
                          selectedTicket.timeRemaining < 60 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, (selectedTicket.timeRemaining / 240) * 100))}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center">
                      {selectedTicket.timeRemaining < 0 ? 'SLA Breached' : 'Time Progress'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                View Full Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
