'use client';

import React, { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
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
  AlertCircle,
  Truck,
  CheckSquare,
  Users,
  Package,
  MapIcon,
  CalendarDays,
  Timer,
  Star
} from 'lucide-react';

interface Installation {
  id: string;
  installationNumber: string;
  customer: {
    name: string;
    company: string;
    phone: string;
    email: string;
    address: string;
    contactPerson: string;
    alternatePhone?: string;
  };
  product: {
    name: string;
    model: string;
    serialNumber: string;
    category: string;
    warrantyType: 'Standard' | 'Extended' | 'Premium';
    value: number;
  };
  installation: {
    type: 'New Installation' | 'Replacement' | 'Upgrade' | 'Relocation';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    complexity: 'Simple' | 'Moderate' | 'Complex' | 'Highly Complex';
    estimatedDuration: string;
    requirements: string[];
    specialInstructions?: string;
  };
  scheduling: {
    requestedDate: string;
    scheduledDate: string;
    preferredTimeSlot: string;
    estimatedStartTime: string;
    estimatedEndTime: string;
    flexibility: 'Strict' | 'Flexible' | 'Emergency';
  };
  team: {
    leadTechnician: string;
    assistantTechnicians: string[];
    teamSize: number;
    specialistRequired: boolean;
    certification: string[];
  };
  status: 'Scheduled' | 'Confirmed' | 'Preparing' | 'En Route' | 'Delayed';
  progress: {
    preparationComplete: boolean;
    materialsReady: boolean;
    toolsChecked: boolean;
    customerNotified: boolean;
    siteAccessConfirmed: boolean;
  };
  location: {
    siteType: 'Indoor' | 'Outdoor' | 'Industrial' | 'Residential' | 'Commercial';
    accessRequirements: string;
    parkingAvailable: boolean;
    elevatorAccess: boolean;
    specialAccess: string;
  };
  materials: {
    partsRequired: string[];
    toolsRequired: string[];
    consumables: string[];
    documentsNeeded: string[];
  };
  createdDate: string;
  lastUpdate: string;
  tags: string[];
  attachments: number;
  notes: string;
  riskFactors: string[];
}

const PendingInstallationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterTechnician, setFilterTechnician] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterComplexity, setFilterComplexity] = useState('');
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Installations loaded from the after-sales installations endpoint.
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const arr = (v: any) => (Array.isArray(v) ? v : []);
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.installations()) as any[];
        const mapped: Installation[] = arr(raw).map((r: any) => ({
          id: String(r?.id ?? ''),
          installationNumber: r?.installationNumber ?? r?.installationNo ?? '',
          customer: {
            name: r?.customer?.name ?? r?.customerName ?? '',
            company: r?.customer?.company ?? '',
            phone: r?.customer?.phone ?? '',
            email: r?.customer?.email ?? '',
            address: r?.customer?.address ?? r?.address ?? '',
            contactPerson: r?.customer?.contactPerson ?? '',
            alternatePhone: r?.customer?.alternatePhone,
          },
          product: {
            name: r?.product?.name ?? r?.productName ?? '',
            model: r?.product?.model ?? '',
            serialNumber: r?.product?.serialNumber ?? '',
            category: r?.product?.category ?? '',
            warrantyType: (r?.product?.warrantyType ?? 'Standard') as Installation['product']['warrantyType'],
            value: Number(r?.product?.value ?? 0) || 0,
          },
          installation: {
            type: (r?.installation?.type ?? 'New Installation') as Installation['installation']['type'],
            priority: (r?.installation?.priority ?? r?.priority ?? 'Medium') as Installation['installation']['priority'],
            complexity: (r?.installation?.complexity ?? 'Moderate') as Installation['installation']['complexity'],
            estimatedDuration: r?.installation?.estimatedDuration ?? '',
            requirements: arr(r?.installation?.requirements),
            specialInstructions: r?.installation?.specialInstructions,
          },
          scheduling: {
            requestedDate: r?.scheduling?.requestedDate ?? r?.requestedDate ?? '',
            scheduledDate: r?.scheduling?.scheduledDate ?? r?.scheduledDate ?? '',
            preferredTimeSlot: r?.scheduling?.preferredTimeSlot ?? '',
            estimatedStartTime: r?.scheduling?.estimatedStartTime ?? '',
            estimatedEndTime: r?.scheduling?.estimatedEndTime ?? '',
            flexibility: (r?.scheduling?.flexibility ?? 'Flexible') as Installation['scheduling']['flexibility'],
          },
          team: {
            leadTechnician: r?.team?.leadTechnician ?? r?.assignedTo ?? '',
            assistantTechnicians: arr(r?.team?.assistantTechnicians),
            teamSize: Number(r?.team?.teamSize ?? 0) || 0,
            specialistRequired: Boolean(r?.team?.specialistRequired),
            certification: arr(r?.team?.certification),
          },
          status: (r?.status ?? 'Scheduled') as Installation['status'],
          progress: {
            preparationComplete: Boolean(r?.progress?.preparationComplete),
            materialsReady: Boolean(r?.progress?.materialsReady),
            toolsChecked: Boolean(r?.progress?.toolsChecked),
            customerNotified: Boolean(r?.progress?.customerNotified),
            siteAccessConfirmed: Boolean(r?.progress?.siteAccessConfirmed),
          },
          location: {
            siteType: (r?.location?.siteType ?? 'Commercial') as Installation['location']['siteType'],
            accessRequirements: r?.location?.accessRequirements ?? '',
            parkingAvailable: Boolean(r?.location?.parkingAvailable),
            elevatorAccess: Boolean(r?.location?.elevatorAccess),
            specialAccess: r?.location?.specialAccess ?? '',
          },
          materials: {
            partsRequired: arr(r?.materials?.partsRequired),
            toolsRequired: arr(r?.materials?.toolsRequired),
            consumables: arr(r?.materials?.consumables),
            documentsNeeded: arr(r?.materials?.documentsNeeded),
          },
          createdDate: r?.createdDate ?? r?.createdAt ?? '',
          lastUpdate: r?.lastUpdate ?? r?.updatedAt ?? '',
          tags: arr(r?.tags),
          attachments: Number(r?.attachments ?? 0) || 0,
          notes: r?.notes ?? '',
          riskFactors: arr(r?.riskFactors),
        }));
        if (!cancelled) setInstallations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load installations');
          setInstallations([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredInstallations = installations.filter(installation => {
    const matchesSearch = installation.installationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         installation.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         installation.customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         installation.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         installation.team.leadTechnician.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = !filterPriority || installation.installation.priority === filterPriority;
    const matchesType = !filterType || installation.installation.type === filterType;
    const matchesTechnician = !filterTechnician || installation.team.leadTechnician === filterTechnician;
    const matchesStatus = !filterStatus || installation.status === filterStatus;
    const matchesComplexity = !filterComplexity || installation.installation.complexity === filterComplexity;
    
    return matchesSearch && matchesPriority && matchesType && matchesTechnician && matchesStatus && matchesComplexity;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-600 bg-blue-50';
      case 'Confirmed': return 'text-green-600 bg-green-50';
      case 'Preparing': return 'text-yellow-600 bg-yellow-50';
      case 'En Route': return 'text-purple-600 bg-purple-50';
      case 'Delayed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'text-green-600 bg-green-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'Complex': return 'text-orange-600 bg-orange-50';
      case 'Highly Complex': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getWarrantyColor = (type: string) => {
    switch (type) {
      case 'Premium': return 'text-purple-600 bg-purple-50';
      case 'Extended': return 'text-blue-600 bg-blue-50';
      case 'Standard': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressPercentage = (progress: Installation['progress']) => {
    const completed = Object.values(progress).filter(Boolean).length;
    const total = Object.keys(progress).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Installations</h1>
        <p className="text-gray-600">Manage and track scheduled installations awaiting execution</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by installation number, customer, product, or technician..."
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="New Installation">New Installation</option>
              <option value="Replacement">Replacement</option>
              <option value="Upgrade">Upgrade</option>
              <option value="Relocation">Relocation</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="En Route">En Route</option>
              <option value="Delayed">Delayed</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filterComplexity}
              onChange={(e) => setFilterComplexity(e.target.value)}
            >
              <option value="">All Complexity</option>
              <option value="Simple">Simple</option>
              <option value="Moderate">Moderate</option>
              <option value="Complex">Complex</option>
              <option value="Highly Complex">Highly Complex</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
            >
              <option value="">All Technicians</option>
              <option value="Robert Chen">Robert Chen</option>
              <option value="Michael Torres">Michael Torres</option>
              <option value="Dr. Amanda Foster">Dr. Amanda Foster</option>
              <option value="Patricia Lee">Patricia Lee</option>
              <option value="Dr. Steven Park">Dr. Steven Park</option>
              <option value="Alex Rodriguez">Alex Rodriguez</option>
              <option value="Daniel Kim">Daniel Kim</option>
              <option value="Michael Johnson">Michael Johnson</option>
            </select>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900">{filteredInstallations.length}</p>
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
                {filteredInstallations.filter(i => i.installation.priority === 'Critical').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delayed</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredInstallations.filter(i => i.status === 'Delayed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready to Start</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredInstallations.filter(i => i.status === 'Confirmed' || i.status === 'En Route').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Installations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installation Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Product
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduling
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team & Progress
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Flag
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstallations.map((installation) => (
                <tr key={installation.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{installation.installationNumber}</div>
                      <div className="text-sm text-gray-600">{installation.installation.type}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(installation.installation.complexity)}`}>
                          {installation.installation.complexity}
                        </span>
                        <span className="text-xs text-gray-500">{installation.installation.estimatedDuration}</span>
                      </div>
                      {installation.attachments > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <FileText className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{installation.attachments} files</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{installation.customer.name}</div>
                      <div className="text-sm text-gray-600">{installation.customer.company}</div>
                      <div className="text-sm text-gray-900 mt-1">{installation.product.name}</div>
                      <div className="text-xs text-gray-500">{installation.product.model}</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getWarrantyColor(installation.product.warrantyType)}`}>
                        {installation.product.warrantyType} Warranty
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(installation.scheduling.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{installation.scheduling.preferredTimeSlot}</div>
                      <div className="text-xs text-gray-500">
                        {installation.scheduling.estimatedStartTime} - {installation.scheduling.estimatedEndTime}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Timer className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{installation.scheduling.flexibility}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{installation.team.leadTechnician}</div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Team of {installation.team.teamSize}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${getProgressPercentage(installation.progress)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getProgressPercentage(installation.progress)}% prepared
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(installation.status)}`}>
                        {installation.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getPriorityColor(installation.installation.priority)}`}>
                        {installation.installation.priority}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Value: ${installation.product.value.toLocaleString()}
                      </div>
                      {installation.riskFactors.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600">{installation.riskFactors.length} risks</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInstallation(installation)}
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
      {selectedInstallation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl  w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedInstallation.installationNumber}</h2>
                  <p className="text-gray-600">{selectedInstallation.installation.type} - {selectedInstallation.product.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInstallation.status)}`}>
                      {selectedInstallation.status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedInstallation.installation.priority)}`}>
                      {selectedInstallation.installation.priority} Flag
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(selectedInstallation.installation.complexity)}`}>
                      {selectedInstallation.installation.complexity}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInstallation(null)}
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
                      <span>{selectedInstallation.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{selectedInstallation.customer.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedInstallation.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedInstallation.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedInstallation.customer.address}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Installation Team</h3>
                  <div className="space-y-2">
                    <div><strong>Lead Technician:</strong> {selectedInstallation.team.leadTechnician}</div>
                    <div><strong>Team Size:</strong> {selectedInstallation.team.teamSize}</div>
                    <div><strong>Assistants:</strong> {selectedInstallation.team.assistantTechnicians.join(', ')}</div>
                    <div><strong>Specialist Required:</strong> {selectedInstallation.team.specialistRequired ? 'Yes' : 'No'}</div>
                    <div>
                      <strong>Certifications:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedInstallation.team.certification.map((cert, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Installation Requirements</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <strong>Duration:</strong> {selectedInstallation.installation.estimatedDuration}
                    </div>
                    <div>
                      <strong>Value:</strong> ${selectedInstallation.product.value.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-3">
                    <strong>Requirements:</strong>
                    <ul className="list-disc list-inside text-gray-700 mt-1">
                      {selectedInstallation.installation.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  {selectedInstallation.installation.specialInstructions && (
                    <div className="mt-3">
                      <strong>Special Instructions:</strong>
                      <p className="text-gray-700 mt-1">{selectedInstallation.installation.specialInstructions}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Preparation Progress</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(selectedInstallation.progress).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckSquare className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 border border-gray-300 rounded"></div>
                        )}
                        <span className={`text-sm ${value ? 'text-green-600' : 'text-gray-600'}`}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full flex items-center justify-center" 
                        style={{ width: `${getProgressPercentage(selectedInstallation.progress)}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {getProgressPercentage(selectedInstallation.progress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Location Details</h3>
                  <div className="space-y-2">
                    <div><strong>Site Type:</strong> {selectedInstallation.location.siteType}</div>
                    <div><strong>Access Requirements:</strong> {selectedInstallation.location.accessRequirements}</div>
                    <div><strong>Parking:</strong> {selectedInstallation.location.parkingAvailable ? 'Available' : 'Not Available'}</div>
                    <div><strong>Elevator Access:</strong> {selectedInstallation.location.elevatorAccess ? 'Yes' : 'No'}</div>
                    <div><strong>Special Access:</strong> {selectedInstallation.location.specialAccess}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Risk Factors</h3>
                  {selectedInstallation.riskFactors.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700">
                      {selectedInstallation.riskFactors.map((risk, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-yellow-500" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No specific risk factors identified</p>
                  )}
                </div>
              </div>

              {selectedInstallation.notes && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedInstallation.notes}</p>
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

export default PendingInstallationsPage;