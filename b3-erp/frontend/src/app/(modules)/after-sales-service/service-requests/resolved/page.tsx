'use client';

import React, { useState, useEffect } from 'react';
import { ServiceRequestService } from '@/services/service-request.service';
import {
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  MessageSquare,
  Flag,
  Tag,
  Building,
  Wrench,
  FileText,
  ExternalLink,
  ThumbsUp,
  Star,
  Award,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  ticketNumber: string;
  customer: {
    name: string;
    company: string;
    phone: string;
    email: string;
    address: string;
  };
  product: {
    name: string;
    model: string;
    serialNumber: string;
    warrantyStatus: 'Active' | 'Expired' | 'Extended';
  };
  issue: {
    title: string;
    description: string;
    category: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    severity: 'Critical' | 'Major' | 'Minor';
  };
  status: 'Resolved' | 'Closed' | 'Customer Approved';
  assignedTo: string;
  assignedTeam: string;
  createdDate: string;
  startedDate: string;
  resolvedDate: string;
  slaStatus: 'Met' | 'Exceeded' | 'Breached';
  resolutionTime: string;
  tags: string[];
  attachments: number;
  lastUpdate: string;
  contactPreference: 'Phone' | 'Email' | 'WhatsApp' | 'SMS';
  estimatedHours: number;
  actualHours: number;
  resolution: {
    summary: string;
    rootCause: string;
    actionsTaken: string[];
    partsReplaced: string[];
    preventiveMeasures: string[];
  };
  customerSatisfaction: {
    rating: number;
    feedback: string;
    wouldRecommend: boolean;
    responseTime: number;
    resolutionQuality: number;
  };
  followUp: {
    scheduled: boolean;
    date?: string;
    type?: string;
    completed?: boolean;
  };
}

const ResolvedServiceRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterSLA, setFilterSLA] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Service returns a flat ServiceRequest shape; map it into this page's
        // nested view model and keep only requests that are resolved/closed.
        const raw = (await ServiceRequestService.getAllServiceRequests()) as any[];
        const priorityMap: Record<string, ServiceRequest['issue']['priority']> = {
          'P1 - Critical': 'Critical', 'P2 - High': 'High',
          'P3 - Medium': 'Medium', 'P4 - Low': 'Low',
        };
        const slaMap: Record<string, ServiceRequest['slaStatus']> = {
          met: 'Met', on_track: 'Met', at_risk: 'Breached', breached: 'Breached',
        };
        const mapped: ServiceRequest[] = (Array.isArray(raw) ? raw : [])
          .filter((r) => {
            const st = String(r.status ?? '').toLowerCase();
            return st === 'resolved' || st === 'closed';
          })
          .map((r) => ({
            id: String(r.id ?? ''),
            ticketNumber: r.ticketNumber ?? r.ticket_number ?? '',
            customer: {
              name: r.customerName ?? r.customer_name ?? '',
              company: r.customerCompany ?? r.company ?? '',
              phone: r.customerPhone ?? r.phone ?? '',
              email: r.customerEmail ?? r.email ?? '',
              address: r.customerAddress ?? r.address ?? '',
            },
            product: {
              name: r.equipmentModel ?? r.equipment_model ?? r.productName ?? '',
              model: r.equipmentModel ?? r.equipment_model ?? '',
              serialNumber: r.serialNumber ?? r.serial_number ?? '',
              warrantyStatus: (r.warrantyStatus as ServiceRequest['product']['warrantyStatus']) ?? 'Active',
            },
            issue: {
              title: r.issueTitle ?? r.title ?? (r.issueDescription ?? r.issue_description ?? ''),
              description: r.issueDescription ?? r.issue_description ?? '',
              category: r.category ?? r.serviceType ?? '',
              priority: priorityMap[r.priority] ?? 'Medium',
              severity: (r.severity as ServiceRequest['issue']['severity']) ?? 'Minor',
            },
            status: (String(r.status ?? '').toLowerCase() === 'closed' ? 'Closed' : 'Resolved') as ServiceRequest['status'],
            assignedTo: r.assignedToName ?? r.assignedTo ?? '',
            assignedTeam: r.assignedTeam ?? '',
            createdDate: r.createdAt ?? r.created_at ?? new Date().toISOString(),
            startedDate: r.startedAt ?? r.started_at ?? r.createdAt ?? '',
            resolvedDate: r.resolvedAt ?? r.resolved_at ?? r.updatedAt ?? '',
            slaStatus: slaMap[r.slaStatus] ?? 'Met',
            resolutionTime: r.resolutionTime != null ? String(r.resolutionTime) : '\u2014',
            tags: Array.isArray(r.tags) ? r.tags : [],
            attachments: Number(r.attachments ?? 0),
            lastUpdate: r.updatedAt ?? r.updated_at ?? r.createdAt ?? new Date().toISOString(),
            contactPreference: (r.contactPreference as ServiceRequest['contactPreference']) ?? 'Email',
            estimatedHours: Number(r.estimatedHours ?? 0),
            actualHours: Number(r.actualHours ?? 0),
            resolution: {
              summary: r.resolutionSummary ?? r.resolution_summary ?? '',
              rootCause: r.rootCause ?? '',
              actionsTaken: Array.isArray(r.actionsTaken) ? r.actionsTaken : [],
              partsReplaced: Array.isArray(r.partsReplaced) ? r.partsReplaced : [],
              preventiveMeasures: Array.isArray(r.preventiveMeasures) ? r.preventiveMeasures : [],
            },
            customerSatisfaction: {
              rating: Number(r.satisfactionRating ?? 0),
              feedback: r.satisfactionFeedback ?? '',
              wouldRecommend: Boolean(r.wouldRecommend ?? false),
              responseTime: Number(r.responseTime ?? 0),
              resolutionQuality: Number(r.resolutionQuality ?? 0),
            },
            followUp: {
              scheduled: Boolean(r.followUpScheduled ?? false),
              date: r.followUpDate ?? undefined,
              type: r.followUpType ?? undefined,
              completed: r.followUpCompleted ?? undefined,
            },
          }));
        if (!cancelled) setServiceRequests(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load service requests');
          setServiceRequests([]);
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

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = request.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = !filterPriority || request.issue.priority === filterPriority;
    const matchesCategory = !filterCategory || request.issue.category === filterCategory;
    const matchesAssignee = !filterAssignee || request.assignedTo === filterAssignee;
    const matchesSLA = !filterSLA || request.slaStatus === filterSLA;
    const matchesRating = !filterRating ||
      (filterRating === '5' && request.customerSatisfaction.rating === 5) ||
      (filterRating === '4+' && request.customerSatisfaction.rating >= 4) ||
      (filterRating === '3+' && request.customerSatisfaction.rating >= 3);

    return matchesSearch && matchesPriority && matchesCategory && matchesAssignee && matchesSLA && matchesRating;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case 'Met': return 'text-green-600 bg-green-50';
      case 'Exceeded': return 'text-blue-600 bg-blue-50';
      case 'Breached': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'text-green-600 bg-green-50';
      case 'Closed': return 'text-gray-600 bg-gray-50';
      case 'Customer Approved': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getWarrantyColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50';
      case 'Extended': return 'text-blue-600 bg-blue-50';
      case 'Expired': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const averageRating = filteredRequests.reduce((sum, r) => sum + r.customerSatisfaction.rating, 0) / filteredRequests.length;
  const slaMetPercentage = (filteredRequests.filter(r => r.slaStatus === 'Met' || r.slaStatus === 'Exceeded').length / filteredRequests.length) * 100;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-3">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resolved Service Requests</h1>
        <p className="text-gray-600">View completed service requests and customer satisfaction metrics</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading service requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Flag className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && serviceRequests.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No resolved service requests found.
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by ticket, customer, assignee, or issue..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-2">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electronics">Electronics</option>
              <option value="Calibration">Calibration</option>
              <option value="Hydraulic">Hydraulic</option>
              <option value="Safety">Safety</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filterSLA}
              onChange={(e) => setFilterSLA(e.target.value)}
            >
              <option value="">All SLA Status</option>
              <option value="Met">Met</option>
              <option value="Exceeded">Exceeded</option>
              <option value="Breached">Breached</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4+">4+ Stars</option>
              <option value="3+">3+ Stars</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <option value="">All Assignees</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Michael Chen">Michael Chen</option>
              <option value="Lisa Martinez">Lisa Martinez</option>
              <option value="James Wilson">James Wilson</option>
              <option value="Carlos Rodriguez">Carlos Rodriguez</option>
              <option value="Amanda Davis">Amanda Davis</option>
              <option value="Emily Johnson">Emily Johnson</option>
              <option value="Kevin Lee">Kevin Lee</option>
            </select>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
              <p className="text-2xl font-bold text-gray-900">{slaMetPercentage.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ThumbsUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Would Recommend</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredRequests.filter(r => r.customerSatisfaction.wouldRecommend).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolution Team
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolution & SLA
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Satisfaction
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{request.ticketNumber}</div>
                      <div className="text-sm text-gray-600 max-w-xs truncate">{request.issue.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.issue.priority)}`}>
                          {request.issue.priority}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {request.issue.category}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(request.status)}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {request.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{request.customer.name}</div>
                      <div className="text-sm text-gray-600">{request.customer.company}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{request.customer.phone}</span>
                      </div>
                      <div className="text-xs text-gray-500">{request.product.name}</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getWarrantyColor(request.product.warrantyStatus)}`}>
                        {request.product.warrantyStatus} Warranty
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{request.assignedTo}</div>
                      <div className="text-sm text-gray-600">{request.assignedTeam}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {request.actualHours}h / {request.estimatedHours}h
                      </div>
                      <div className="text-xs text-gray-400">
                        Resolved: {new Date(request.resolvedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSLAStatusColor(request.slaStatus)}`}>
                        {request.slaStatus === 'Met' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {request.slaStatus === 'Exceeded' && <Award className="h-3 w-3 mr-1" />}
                        {request.slaStatus}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">Time: {request.resolutionTime}</div>
                      {request.followUp.scheduled && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">Follow-up scheduled</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        {renderStars(request.customerSatisfaction.rating)}
                        <span className="text-sm text-gray-600 ml-2">
                          {request.customerSatisfaction.rating}/5
                        </span>
                      </div>
                      {request.customerSatisfaction.wouldRecommend && (
                        <div className="flex items-center gap-1 mt-1">
                          <ThumbsUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">Would recommend</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                        "{request.customerSatisfaction.feedback}"
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-800"

                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800"

                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-800"

                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800"

                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl  w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedRequest.ticketNumber}</h2>
                  <p className="text-gray-600">{selectedRequest.issue.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                    <span className="text-sm text-gray-600">•</span>
                    <div className="flex items-center gap-1">
                      {renderStars(selectedRequest.customerSatisfaction.rating)}
                      <span className="text-sm text-gray-600 ml-1">Customer Rating</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.customer.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.customer.email}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Resolution Summary</h3>
                  <div className="space-y-2">
                    <div><strong>Assigned To:</strong> {selectedRequest.assignedTo}</div>
                    <div><strong>Team:</strong> {selectedRequest.assignedTeam}</div>
                    <div><strong>Resolution Time:</strong> {selectedRequest.resolutionTime}</div>
                    <div><strong>Hours:</strong> {selectedRequest.actualHours} / {selectedRequest.estimatedHours}</div>
                    <div>
                      <strong>SLA Status:</strong>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSLAStatusColor(selectedRequest.slaStatus)}`}>
                        {selectedRequest.slaStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Resolution Details</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700 mb-3">{selectedRequest.resolution.summary}</p>
                  <div className="space-y-3">
                    <div>
                      <strong className="text-gray-900">Root Cause:</strong>
                      <p className="text-gray-700">{selectedRequest.resolution.rootCause}</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">Actions Taken:</strong>
                      <ul className="list-disc list-inside text-gray-700 mt-1">
                        {selectedRequest.resolution.actionsTaken.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                    {selectedRequest.resolution.partsReplaced.length > 0 && (
                      <div>
                        <strong className="text-gray-900">Parts Replaced:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRequest.resolution.partsReplaced.map((part, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <strong className="text-gray-900">Preventive Measures:</strong>
                      <ul className="list-disc list-inside text-gray-700 mt-1">
                        {selectedRequest.resolution.preventiveMeasures.map((measure, index) => (
                          <li key={index}>{measure}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Satisfaction</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <strong>Overall Rating:</strong>
                        <div className="flex items-center gap-1">
                          {renderStars(selectedRequest.customerSatisfaction.rating)}
                          <span className="ml-1">({selectedRequest.customerSatisfaction.rating}/5)</span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <strong>Response Time:</strong> {selectedRequest.customerSatisfaction.responseTime}/5
                      </div>
                      <div className="mb-2">
                        <strong>Resolution Quality:</strong> {selectedRequest.customerSatisfaction.resolutionQuality}/5
                      </div>
                      {selectedRequest.customerSatisfaction.wouldRecommend && (
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">Would recommend our service</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <strong>Customer Feedback:</strong>
                      <p className="text-gray-700 italic mt-1">"{selectedRequest.customerSatisfaction.feedback}"</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.followUp.scheduled && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Follow-up</h3>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <span><strong>Scheduled:</strong> {selectedRequest.followUp.date && new Date(selectedRequest.followUp.date).toLocaleDateString()}</span>
                    </div>
                    <div><strong>Type:</strong> {selectedRequest.followUp.type}</div>
                    <div><strong>Status:</strong> {selectedRequest.followUp.completed ? 'Completed' : 'Pending'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolvedServiceRequestsPage;