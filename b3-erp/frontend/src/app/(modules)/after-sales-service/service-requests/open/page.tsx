'use client';

import React, { useState, useEffect } from 'react';
import { ServiceRequestService } from '@/services/service-request.service';
import {
  AlertCircle,
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
  ExternalLink
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
  status: 'Open' | 'Assigned' | 'In Progress' | 'Pending Parts' | 'Customer Response Required';
  assignedTo?: string;
  createdDate: string;
  expectedResolution: string;
  slaStatus: 'On Track' | 'At Risk' | 'Breached';
  timeRemaining: string;
  tags: string[];
  attachments: number;
  lastUpdate: string;
  contactPreference: 'Phone' | 'Email' | 'WhatsApp' | 'SMS';
}

const OpenServiceRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSLA, setFilterSLA] = useState('');
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
        // nested view model and keep only requests that are still open.
        const raw = (await ServiceRequestService.getAllServiceRequests()) as any[];
        const priorityMap: Record<string, ServiceRequest['issue']['priority']> = {
          'P1 - Critical': 'Critical', 'P2 - High': 'High',
          'P3 - Medium': 'Medium', 'P4 - Low': 'Low',
        };
        const slaMap: Record<string, ServiceRequest['slaStatus']> = {
          on_track: 'On Track', at_risk: 'At Risk', breached: 'Breached', met: 'On Track',
        };
        const mapped: ServiceRequest[] = (Array.isArray(raw) ? raw : [])
          .filter((r) => {
            const s = String(r.status ?? '').toLowerCase();
            return s === 'open' || s === 'acknowledged';
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
            status: 'Open',
            assignedTo: r.assignedToName ?? r.assignedTo ?? undefined,
            createdDate: r.createdAt ?? r.created_at ?? new Date().toISOString(),
            expectedResolution: r.resolutionDeadline ?? r.resolution_deadline ?? '',
            slaStatus: slaMap[r.slaStatus] ?? 'On Track',
            timeRemaining: r.timeRemaining ?? '—',
            tags: Array.isArray(r.tags) ? r.tags : [],
            attachments: Number(r.attachments ?? 0),
            lastUpdate: r.updatedAt ?? r.updated_at ?? r.createdAt ?? new Date().toISOString(),
            contactPreference: (r.contactPreference as ServiceRequest['contactPreference']) ?? 'Email',
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
      request.product.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = !filterPriority || request.issue.priority === filterPriority;
    const matchesCategory = !filterCategory || request.issue.category === filterCategory;
    const matchesSLA = !filterSLA || request.slaStatus === filterSLA;

    return matchesSearch && matchesPriority && matchesCategory && matchesSLA;
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
      case 'On Track': return 'text-green-600 bg-green-50';
      case 'At Risk': return 'text-yellow-600 bg-yellow-50';
      case 'Breached': return 'text-red-600 bg-red-50';
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-3">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Open Service Requests</h1>
        <p className="text-gray-600">Manage and track all open service requests requiring attention</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading service requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && serviceRequests.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No open service requests found.
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
                placeholder="Search by ticket number, customer, company, or issue..."
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
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-2">
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
              <option value="Software">Software</option>
              <option value="Hydraulic">Hydraulic</option>
              <option value="Calibration">Calibration</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filterSLA}
              onChange={(e) => setFilterSLA(e.target.value)}
            >
              <option value="">All SLA Status</option>
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Breached">Breached</option>
            </select>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Open</p>
              <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Flag</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredRequests.filter(r => r.issue.priority === 'Critical').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">SLA At Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredRequests.filter(r => r.slaStatus === 'At Risk' || r.slaStatus === 'Breached').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unassigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredRequests.filter(r => !r.assignedTo).length}
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
                  Product
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flag & SLA
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
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
                      {request.attachments > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <FileText className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{request.attachments} attachments</span>
                        </div>
                      )}
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
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{request.customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{request.product.name}</div>
                      <div className="text-sm text-gray-600">{request.product.model}</div>
                      <div className="text-xs text-gray-500">{request.product.serialNumber}</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getWarrantyColor(request.product.warrantyStatus)}`}>
                        {request.product.warrantyStatus} Warranty
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSLAStatusColor(request.slaStatus)}`}>
                        {request.slaStatus}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{request.timeRemaining}</div>
                      <div className="text-xs text-gray-400">
                        Severity: {request.issue.severity}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Created: {new Date(request.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Expected: {new Date(request.expectedResolution).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Updated: {new Date(request.lastUpdate).toLocaleString()}
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
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-800"

                      >
                        <MessageSquare className="h-4 w-4" />
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
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedRequest.customer.address}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.product.name}</span>
                    </div>
                    <div><strong>Model:</strong> {selectedRequest.product.model}</div>
                    <div><strong>Serial Number:</strong> {selectedRequest.product.serialNumber}</div>
                    <div>
                      <strong>Warranty:</strong>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWarrantyColor(selectedRequest.product.warrantyStatus)}`}>
                        {selectedRequest.product.warrantyStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Issue Details</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{selectedRequest.issue.description}</p>
                  <div className="flex gap-2 mt-3">
                    {selectedRequest.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <strong>Status:</strong> {selectedRequest.status}
                </div>
                <div>
                  <strong>SLA Status:</strong>
                  <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSLAStatusColor(selectedRequest.slaStatus)}`}>
                    {selectedRequest.slaStatus}
                  </span>
                </div>
                <div>
                  <strong>Contact Preference:</strong> {selectedRequest.contactPreference}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenServiceRequestsPage;