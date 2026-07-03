'use client';

import React, { useState, useEffect } from 'react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Calendar,
  FileText,
  Eye,
  Edit,
  X as XIcon,
  MessageSquare
} from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  equipmentCode: string;
  equipmentName: string;
  location: string;
  requestType: 'breakdown' | 'preventive' | 'corrective' | 'inspection';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  requestedBy: string;
  requestDate: string;
  description: string;
  assignedTo: string | null;
  estimatedCost: number;
  actualCost: number | null;
  completionDate: string | null;
  downtime: number; // hours
}

export default function MaintenanceRequestsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getMaintenanceRequests()) as any[];
        const mapped = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => ({
          ...d,
          id: String(d?.id ?? i),
        })) as unknown as MaintenanceRequest[];
        if (!cancelled) setMaintenanceRequests(mapped);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message ?? 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch =
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalRequests = maintenanceRequests.length;
  const pending = maintenanceRequests.filter(r => r.status === 'pending').length;
  const inProgress = maintenanceRequests.filter(r => r.status === 'in-progress').length;
  const completed = maintenanceRequests.filter(r => r.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'breakdown': return '🔴';
      case 'preventive': return '🛡️';
      case 'corrective': return '⚠️';
      case 'inspection': return '🔍';
      default: return '🔧';
    }
  };

  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
  };

  const handleCreateRequest = () => {
    setShowCreateModal(true);
  };

  const handleApproveRequest = (request: MaintenanceRequest) => {
    if (confirm(`Approve maintenance request ${request.requestNumber}?`)) {
      alert(`Request ${request.requestNumber} approved! Assigned to maintenance team.`);
    }
  };

  const handleRejectRequest = (request: MaintenanceRequest) => {
    if (confirm(`Reject maintenance request ${request.requestNumber}?`)) {
      alert(`Request ${request.requestNumber} rejected.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Create and manage maintenance requests</p>
          </div>
        </div>
        <button
          onClick={handleCreateRequest}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{inProgress}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-2">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">{request.requestNumber}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className="text-sm">
                    {getRequestTypeIcon(request.requestType)} {request.requestType}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-900">{request.equipmentCode}</span>
                  <span className="text-gray-600"> - {request.equipmentName}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{request.requestedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{request.requestDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {request.downtime > 0 ? (
                      <span className="text-red-600 font-semibold">{request.downtime}h downtime</span>
                    ) : (
                      <span>No downtime</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Est. Cost:</span> ₹{(request.estimatedCost / 1000).toFixed(0)}K
                  </div>
                </div>
                {request.assignedTo && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="font-semibold text-blue-600 ml-1">{request.assignedTo}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleViewRequest(request)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproveRequest(request)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Reject"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-3 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-gray-900">Request Details - {selectedRequest.requestNumber}</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Equipment Code</label>
                  <p className="text-gray-900">{selectedRequest.equipmentCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Equipment Name</label>
                  <p className="text-gray-900">{selectedRequest.equipmentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900">{selectedRequest.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Request Type</label>
                  <p className="text-gray-900 capitalize">{selectedRequest.requestType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Requested By</label>
                  <p className="text-gray-900">{selectedRequest.requestedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Request Date</label>
                  <p className="text-gray-900">{selectedRequest.requestDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estimated Cost</label>
                  <p className="text-gray-900">₹{selectedRequest.estimatedCost.toLocaleString()}</p>
                </div>
                {selectedRequest.actualCost && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Actual Cost</label>
                    <p className="text-gray-900">₹{selectedRequest.actualCost.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Downtime</label>
                  <p className="text-gray-900">{selectedRequest.downtime} hours</p>
                </div>
                {selectedRequest.assignedTo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned To</label>
                    <p className="text-gray-900">{selectedRequest.assignedTo}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1">{selectedRequest.description}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-3 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create New Maintenance Request</h2>
            <p className="text-gray-600 mb-2">Form fields will be added here...</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('New maintenance request created and submitted for approval!');
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
