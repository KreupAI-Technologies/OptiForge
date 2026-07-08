'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, AlertTriangle, CheckCircle, Clock, XCircle, ArrowUpCircle, User, Calendar, Download, Filter, X, UserCheck, MessageSquare, Phone, Mail, MapPin, Package, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/export';
import { ServiceRequestService, ServiceRequest, ServiceRequestStatus } from '@/services/service-request.service';

const priorityColors = {
  'P1 - Critical': 'bg-red-100 text-red-700 border-red-300',
  'P2 - High': 'bg-orange-100 text-orange-700 border-orange-300',
  'P3 - Medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'P4 - Low': 'bg-blue-100 text-blue-700 border-blue-300',
};

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  acknowledged: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons = {
  open: Clock,
  acknowledged: CheckCircle,
  in_progress: ArrowUpCircle,
  resolved: CheckCircle,
  closed: XCircle,
  cancelled: XCircle,
};

const slaStatusColors = {
  on_track: 'text-green-600',
  at_risk: 'text-yellow-600',
  breached: 'text-red-600',
  met: 'text-green-600',
};

const channelColors = {
  'Phone': 'bg-blue-100 text-blue-700',
  'Email': 'bg-purple-100 text-purple-700',
  'Web': 'bg-cyan-100 text-cyan-700',
  'Mobile': 'bg-orange-100 text-orange-700',
  'WhatsApp': 'bg-green-100 text-green-700',
  'Chat': 'bg-pink-100 text-pink-700',
};

export default function ServiceRequestsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [assignFormData, setAssignFormData] = useState({
    engineerId: '',
    engineerName: '',
    priority: '' as ServiceRequest['priority'],
    notes: ''
  });
  const [statusFormData, setStatusFormData] = useState({
    status: '' as ServiceRequest['status'],
    resolution: '',
    notes: ''
  });

  // Data fetching states
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ServiceRequestService.getAllServiceRequests();
      setServiceRequests(data);
    } catch (err) {
      setError('Failed to load service requests. Please try again.');
      console.error('Error fetching service requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch service requests on mount
  useEffect(() => {
    fetchServiceRequests();
  }, []);

  // Filter service requests
  const filteredRequests = serviceRequests.filter((request) => {
    const matchesSearch =
      request.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.issueDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics
  const activeStatuses: ServiceRequestStatus[] = ['open', 'acknowledged', 'in_progress'];
  const requestsWithResponse = serviceRequests.filter(r => r.responseTime);
  const stats = {
    totalRequests: serviceRequests.length,
    openRequests: serviceRequests.filter(r => activeStatuses.includes(r.status)).length,
    slaBreached: serviceRequests.filter(r => r.slaStatus === 'breached').length,
    p1Critical: serviceRequests.filter(r => r.priority === 'P1 - Critical' && activeStatuses.includes(r.status)).length,
    avgResponseTime: requestsWithResponse.length > 0
      ? requestsWithResponse.reduce((sum, r) => sum + (r.responseTime || 0), 0) / requestsWithResponse.length
      : 0,
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 px-3 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading service requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 px-3 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return <span className="text-red-600 font-medium">Overdue</span>;
    if (hours < 2) return <span className="text-red-600 font-medium">{hours}h {minutes}m left</span>;
    if (hours < 4) return <span className="text-orange-600 font-medium">{hours}h {minutes}m left</span>;
    return <span className="text-gray-600">{hours}h {minutes}m left</span>;
  };

  const handleViewDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleAssign = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setAssignFormData({
      engineerId: request.assignedTo || '',
      engineerName: request.assignedToName || '',
      priority: request.priority,
      notes: ''
    });
    setShowAssignModal(true);
  };

  const handleUpdateStatus = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setStatusFormData({
      status: request.status,
      resolution: '',
      notes: ''
    });
    setShowStatusModal(true);
  };

  const handleExport = () => {
    exportToCsv('service-requests', filteredRequests);
    toast({
      title: "Export Started",
      description: "Service requests are being exported to CSV format."
    });
  };

  const submitAssignment = async () => {
    if (!selectedRequest || !assignFormData.engineerId) return;
    try {
      setSubmitting(true);
      await ServiceRequestService.assignServiceRequest(
        selectedRequest.id,
        assignFormData.engineerId,
        assignFormData.engineerName,
      );
      toast({
        title: "Ticket Assigned",
        description: `${selectedRequest.ticketNumber} has been assigned to ${assignFormData.engineerName}.`
      });
      setShowAssignModal(false);
      await fetchServiceRequests();
    } catch (err) {
      console.error('Error assigning service request:', err);
      toast({
        title: "Assignment Failed",
        description: "Could not assign the ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitStatusUpdate = async () => {
    if (!selectedRequest || !statusFormData.status) return;
    try {
      setSubmitting(true);
      const id = selectedRequest.id;
      const status = statusFormData.status;
      switch (status) {
        case 'acknowledged':
          await ServiceRequestService.acknowledgeServiceRequest(id);
          break;
        case 'in_progress':
          await ServiceRequestService.startServiceRequest(id);
          break;
        case 'resolved':
          await ServiceRequestService.resolveServiceRequest(id, statusFormData.resolution, 'system');
          break;
        case 'closed':
          await ServiceRequestService.closeServiceRequest(id, 'system', statusFormData.notes || statusFormData.resolution);
          break;
        case 'cancelled':
          await ServiceRequestService.cancelServiceRequest(id, statusFormData.notes || 'Cancelled by agent');
          break;
        default:
          await ServiceRequestService.updateServiceRequest(id, { status });
      }
      toast({
        title: "Status Updated",
        description: `${selectedRequest.ticketNumber} status has been updated to ${status}.`
      });
      setShowStatusModal(false);
      await fetchServiceRequests();
    } catch (err) {
      console.error('Error updating service request status:', err);
      toast({
        title: "Update Failed",
        description: "Could not update the status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 px-3 py-2">
      <div className="w-full space-y-3">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-orange-600">{stats.openRequests}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SLA Breached</p>
                <p className="text-2xl font-bold text-red-600">{stats.slaBreached}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">P1 Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.p1Critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgResponseTime.toFixed(1)}h</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by ticket number, customer, or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push('/after-sales-service/service-requests/sla-dashboard')}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                SLA Dashboard
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => router.push('/after-sales-service/service-requests/add')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Request
              </button>
            </div>
          </div>
        </div>

        {/* Service Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Details
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue & Equipment
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SLA Status
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRequests.map((request) => {
                  const StatusIcon = statusIcons[request.status];
                  return (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{request.ticketNumber}</span>
                          <span className="text-sm text-gray-600">{request.customerName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[request.priority]}`}>
                          {request.priority}
                        </span>
                        {request.escalationLevel > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-red-600 font-medium">
                              Escalated L{request.escalationLevel}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col max-w-xs">
                          <span className="text-sm text-gray-900 truncate">{request.issueDescription}</span>
                          {request.equipmentModel && (
                            <span className="text-xs text-gray-500 mt-1">{request.equipmentModel}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${channelColors[request.channel]}`}>
                          {request.channel}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {request.assignedToName ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{request.assignedToName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className={`text-xs font-medium ${slaStatusColors[request.slaStatus]}`}>
                            {request.slaStatus.replace('_', ' ').toUpperCase()}
                          </span>
                          {['open', 'acknowledged', 'in_progress'].includes(request.status) && (
                            <div className="text-xs mt-1">
                              {getTimeRemaining(request.resolutionDeadline)}
                            </div>
                          )}
                          {request.responseTime && (
                            <span className="text-xs text-gray-500 mt-1">
                              Response: {request.responseTime}h
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!request.assignedTo && (
                            <button
                              onClick={() => handleAssign(request)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Assign Engineer"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(request)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <Edit className="h-4 w-4" />
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
          {totalPages > 1 && (
            <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* View Details Modal */}
          {showDetailsModal && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
              <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg z-10">
                  <div>
                    <h2 className="text-xl font-bold">{selectedRequest.ticketNumber}</h2>
                    <p className="text-sm text-blue-100 mt-1">Service Request Details</p>
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
                  {/* Customer Information */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-blue-600">Customer Name</p>
                        <p className="font-semibold text-blue-900">{selectedRequest.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Customer ID</p>
                        <p className="font-semibold text-blue-900">{selectedRequest.customerId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Issue Details */}
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Issue Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-purple-600">Issue Description</p>
                        <p className="font-semibold text-purple-900">{selectedRequest.issueDescription}</p>
                      </div>
                      {selectedRequest.equipmentModel && (
                        <div>
                          <p className="text-sm text-purple-600">Equipment Model</p>
                          <p className="font-semibold text-purple-900">{selectedRequest.equipmentModel}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-sm text-purple-600">Priority</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[selectedRequest.priority]}`}>
                            {selectedRequest.priority}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-purple-600">Status</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedRequest.status]}`}>
                            {selectedRequest.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-purple-600">Channel</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${channelColors[selectedRequest.channel]}`}>
                            {selectedRequest.channel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignment & Timeline */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Assignment
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-green-600">Assigned To</p>
                          <p className="font-semibold text-green-900">
                            {selectedRequest.assignedToName || 'Not Assigned'}
                          </p>
                          {selectedRequest.assignedTo && (
                            <p className="text-xs text-green-600">{selectedRequest.assignedTo}</p>
                          )}
                        </div>
                        {selectedRequest.escalationLevel > 0 && (
                          <div>
                            <p className="text-sm text-red-600">Escalation Level</p>
                            <p className="font-bold text-red-700">Level {selectedRequest.escalationLevel}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Timeline
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-orange-600">Created At</p>
                          <p className="font-semibold text-orange-900">
                            {new Date(selectedRequest.createdAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-600">Response Deadline</p>
                          <p className="font-semibold text-orange-900">
                            {new Date(selectedRequest.responseDeadline).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-600">Resolution Deadline</p>
                          <p className="font-semibold text-orange-900">
                            {new Date(selectedRequest.resolutionDeadline).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SLA Status */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3">SLA Performance</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-sm text-gray-600">SLA Status</p>
                        <span className={`inline-flex text-xs font-medium ${slaStatusColors[selectedRequest.slaStatus]}`}>
                          {selectedRequest.slaStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      {selectedRequest.responseTime && (
                        <div>
                          <p className="text-sm text-gray-600">Response Time</p>
                          <p className="font-semibold text-gray-900">{selectedRequest.responseTime} hours</p>
                        </div>
                      )}
                      {selectedRequest.resolutionTime && (
                        <div>
                          <p className="text-sm text-gray-600">Resolution Time</p>
                          <p className="font-semibold text-gray-900">{selectedRequest.resolutionTime} hours</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
                  {!selectedRequest.assignedTo && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleAssign(selectedRequest);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      Assign Engineer
                    </button>
                  )}
                  {['open', 'acknowledged', 'in_progress'].includes(selectedRequest.status) && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleUpdateStatus(selectedRequest);
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Update Status
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assign Engineer Modal */}
          {showAssignModal && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg z-10">
                  <div>
                    <h2 className="text-xl font-bold">Assign Service Engineer</h2>
                    <p className="text-sm text-green-100 mt-1">{selectedRequest.ticketNumber}</p>
                  </div>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-3">
                  {/* Issue Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3">Request Summary</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-semibold text-gray-900">{selectedRequest.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Issue</p>
                        <p className="font-semibold text-gray-900">{selectedRequest.issueDescription}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-600">Priority</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[selectedRequest.priority]}`}>
                            {selectedRequest.priority}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Equipment</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedRequest.equipmentModel || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Form */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Engineer <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={assignFormData.engineerId}
                        onChange={(e) => {
                          const selected = e.target.value;
                          const engineerName = e.target.options[e.target.selectedIndex].text;
                          setAssignFormData({ ...assignFormData, engineerId: selected, engineerName });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Choose an engineer</option>
                        <option value="ENG001">Rajesh Kumar - Service Technician</option>
                        <option value="ENG002">Amit Sharma - Senior Engineer</option>
                        <option value="ENG003">Priya Patel - Field Engineer</option>
                        <option value="ENG004">Suresh Reddy - Technical Expert</option>
                        <option value="ENG005">Arun Verma - Service Specialist</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Priority (Optional)
                      </label>
                      <select
                        value={assignFormData.priority}
                        onChange={(e) => setAssignFormData({ ...assignFormData, priority: e.target.value as ServiceRequest['priority'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="P1 - Critical">P1 - Critical</option>
                        <option value="P2 - High">P2 - High</option>
                        <option value="P3 - Medium">P3 - Medium</option>
                        <option value="P4 - Low">P4 - Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assignment Notes
                      </label>
                      <textarea
                        value={assignFormData.notes}
                        onChange={(e) => setAssignFormData({ ...assignFormData, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                        placeholder="Add any special instructions or notes for the engineer..."
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Assignment Notification</p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• The engineer will receive an email and mobile notification</li>
                          <li>• SLA timer starts immediately upon assignment</li>
                          <li>• Customer will be notified of the assigned engineer</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAssignment}
                    disabled={!assignFormData.engineerId || submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                    {submitting ? 'Assigning...' : 'Assign Engineer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Update Status Modal */}
          {showStatusModal && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg z-10">
                  <div>
                    <h2 className="text-xl font-bold">Update Request Status</h2>
                    <p className="text-sm text-purple-100 mt-1">{selectedRequest.ticketNumber}</p>
                  </div>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-3">
                  {/* Current Status */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3">Current Status</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedRequest.status]}`}>
                        {selectedRequest.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Status Update Form */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={statusFormData.status}
                        onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value as ServiceRequest['status'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select new status</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {(statusFormData.status === 'resolved' || statusFormData.status === 'closed') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resolution Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={statusFormData.resolution}
                          onChange={(e) => setStatusFormData({ ...statusFormData, resolution: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                          placeholder="Describe how the issue was resolved..."
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={statusFormData.notes}
                        onChange={(e) => setStatusFormData({ ...statusFormData, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        placeholder="Add any additional notes about this status update..."
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Status Update Impact</p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Customer will receive an automated notification</li>
                          <li>• Status change will be logged in the ticket history</li>
                          <li>• Resolving/Closing will stop the SLA timer</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitStatusUpdate}
                    disabled={!statusFormData.status || submitting}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {submitting ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
